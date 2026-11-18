"use client";

import dynamic from "next/dynamic";

import { env } from "@/config/env";
import { jejuSeed } from "@/features/dnd/data/jeju-seed";
import type { RouteRow } from "@/features/dnd/data/route-rows";
import { buildPlannerTree } from "@/features/dnd/stage-c/utils/build-planner-tree";

// Mapbox 토큰이 있으면 원본 Trego 지도(dnd/map)를 쓴다. mapbox-gl은 브라우저 전용이고 무거워서 따로 불러온다
const PlannerMap = dynamic(() => import("@/features/dnd/map/planner-map").then((m) => m.PlannerMap), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-lg border bg-[#eef1f3]" />,
});

// 트리의 현재 구조(rows)를 시드 노드에 덮어써 원본과 같은 PlannerTree로 만든다
function toPlannerTree(rows: readonly RouteRow[]) {
  const byPathId = new Map(rows.map((row) => [row.pathId, row]));
  return buildPlannerTree(
    jejuSeed.flatMap((node) => {
      const row = byPathId.get(node.pathId);
      return row ? [{ ...node, parentPathId: row.parentPathId, position: row.position }] : [];
    }),
  );
}

// 토큰이 없을 때 쓰는 데모용 단순 지도. 시드의 위경도를 평면에 펴서 그린 것이고, 거리는 직선거리다.
const W = 300;
const H = 200;
const PAD = 28;

type Place = { pathId: string; name: string; latitude: number; longitude: number; parentPathId: string | null };

const places = new Map<string, Place>(
  jejuSeed.flatMap((node) =>
    node.kind === "activity" && node.latitude !== null && node.longitude !== null
      ? [[node.pathId, { ...node, latitude: node.latitude, longitude: node.longitude }] as const]
      : [],
  ),
);
const days = jejuSeed.flatMap((node) => (node.kind === "day" ? [node] : []));

// 처음부터 일정에 들어 있던 장소로 범위를 잡는다. 가고 싶은 곳의 성산일출봉은 멀어서 빼야 지도가 안 쪼그라든다.
const seeded = [...places.values()].filter((place) => days.some((day) => day.pathId === place.parentPathId));
const lats = seeded.map((place) => place.latitude);
const lons = seeded.map((place) => place.longitude);
const minLat = Math.min(...lats);
const minLon = Math.min(...lons);
const lonScale = Math.cos((((minLat + Math.max(...lats)) / 2) * Math.PI) / 180);
const dx = (Math.max(...lons) - minLon) * lonScale;
const dy = Math.max(...lats) - minLat;
const scale = Math.min((W - PAD * 2) / dx, (H - PAD * 2) / dy);
const offsetX = (W - dx * scale) / 2;
const offsetY = (H - dy * scale) / 2;

const project = (latitude: number, longitude: number) => ({
  x: offsetX + (longitude - minLon) * lonScale * scale,
  y: H - offsetY - (latitude - minLat) * scale,
});

function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.latitude - a.latitude) * rad) / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(((b.longitude - a.longitude) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

// 날짜 아래에 있는 장소만, 트리의 현재 순서대로
function routeOf(rows: readonly RouteRow[], dayPathId: string) {
  return rows
    .filter((row) => row.parentPathId === dayPathId && places.has(row.pathId))
    .sort((a, b) => a.position - b.position)
    .flatMap((row) => {
      const place = places.get(row.pathId);
      return place ? [place] : [];
    });
}

export function RouteMap({ rows }: { rows: readonly RouteRow[] }) {
  const routes = days.map((day) => ({ day, stops: routeOf(rows, day.pathId) }));
  const total = routes.reduce(
    (sum, { stops }) => sum + stops.slice(1).reduce((acc, stop, i) => acc + distanceKm(stops[i], stop), 0),
    0,
  );

  const accessToken = env.mapboxAccessToken;
  const tree = toPlannerTree(rows);

  return (
    <div className="space-y-3">
      {accessToken ? (
        <PlannerMap accessToken={accessToken} tree={tree} />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-sky-50">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="제주 북서쪽 지도. 날짜마다 색이 다른 선으로 장소가 이어져요">
            {routes.map(({ day, stops }) => {
              const color = day.color ?? "#444";
              const points = stops.map((stop) => project(stop.latitude, stop.longitude));
              return (
                <g key={day.pathId}>
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {stops.map((stop, i) => (
                    <g key={stop.pathId}>
                      <circle cx={points[i].x} cy={points[i].y} r="8" fill="white" stroke={color} strokeWidth="1.5" />
                      <text x={points[i].x} y={points[i].y + 3.5} textAnchor="middle" fontSize="9" fontWeight="600">
                        {i + 1}
                      </text>
                      <text x={points[i].x} y={points[i].y - 12} textAnchor="middle" fontSize="8" fill="oklch(0.35 0 0)">
                        {stop.name}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="날짜별 색">
        {days.map((day) => (
          <li key={day.pathId} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full" style={{ background: day.color ?? undefined }} />
            {day.name}
          </li>
        ))}
      </ul>
      <p className="text-sm" aria-live="polite">
        총 이동 <b>{total.toFixed(1)} km</b>
        <span className="ml-2 text-xs text-muted-foreground">직선거리, 놓은 뒤 기준</span>
      </p>
    </div>
  );
}

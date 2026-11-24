"use client";

import dynamic from "next/dynamic";

import { useMemo } from "react";

import { env } from "@/config/env";
import { cn } from "@/lib/utils";
import { jejuSeed } from "@/features/dnd/data/jeju-seed";
import type { DragPreview, RouteRow } from "@/features/dnd/data/route-rows";
import { withDragPreview } from "@/features/dnd/data/with-drag-preview";
import { buildPlannerTree } from "@/features/dnd/stage-c/utils/build-planner-tree";

// Mapbox 토큰이 있으면 원본 Trego 지도(dnd/map)를 쓴다. mapbox-gl은 브라우저 전용이고 무거워서 따로 불러온다
const PlannerMap = dynamic(() => import("@/features/dnd/map/planner-map").then((m) => m.PlannerMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[360px] rounded-lg border bg-[#eef1f3]" />,
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

export function RouteMap({
  rows,
  dragPreview = null,
  fill,
}: {
  rows: readonly RouteRow[];
  dragPreview?: DragPreview | null;
  fill?: boolean;
}) {
  const previewRows = useMemo(() => withDragPreview(rows, dragPreview), [rows, dragPreview]);
  // 드래그 중 카메라가 볼 컨테이너: 놓일 자리의 부모, 자리가 없으면 원래 부모
  const dragFocusPathId = dragPreview
    ? (dragPreview.destination?.parentPathId ??
      rows.find((row) => row.pathId === dragPreview.activePathId)?.parentPathId ??
      null)
    : null;
  const routes = days.map((day) => ({ day, stops: routeOf(previewRows, day.pathId) }));

  const accessToken = env.mapboxAccessToken;
  const tree = useMemo(() => toPlannerTree(previewRows), [previewRows]);

  return (
    <div className={fill ? "absolute inset-0" : "space-y-3"}>
      {accessToken ? (
        <PlannerMap accessToken={accessToken} tree={tree} dragFocusPathId={dragFocusPathId} fill={fill} />
      ) : (
        <div className={fill ? "h-full overflow-hidden bg-sky-50" : "overflow-hidden rounded-lg border bg-sky-50"}>
          <svg viewBox={`0 0 ${W} ${H}`} className={fill ? "block h-full w-full" : "block w-full"} role="img" aria-label="제주 북서쪽 지도. 날짜마다 색이 다른 선으로 장소가 이어집니다">
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
      <ul
        className={cn(
          "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
          // 채움 모드에서는 지도 왼쪽 위에 얹는다
          fill && "absolute top-3 left-3 rounded-lg bg-card/90 px-3 py-2 ring-1 ring-black/5",
        )}
        aria-label="날짜별 색"
      >
        {days.map((day) => (
          <li key={day.pathId} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full" style={{ background: day.color ?? undefined }} />
            {day.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

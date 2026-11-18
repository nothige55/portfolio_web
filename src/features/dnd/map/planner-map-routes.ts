// 원본: trego-web-portfolio src/features/planner/map/planner-map-routes.ts
// Day 경로선 레이어의 생성과 갱신, 그리고 경로선 위에서 일어나는 hover/click 처리를 담당

import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";

import type { HoveredMarkerRef, PlannerMapHandlers } from "@/features/dnd/map/planner-map-markers";
import type { PlannerMapRoute } from "@/features/dnd/map/planner-map-model";
import type { PlannerRouteHoverProgress } from "@/features/dnd/map/planner-route-hover-progress";

const ROUTE_SOURCE_ID = "planner-routes";
const ROUTE_BORDER_LAYER_ID = "planner-route-borders";
const ROUTE_LAYER_ID = "planner-route-lines";

type PlannerRoutesGeoJson = {
  readonly type: "FeatureCollection";
  readonly features: Array<{
    readonly type: "Feature";
    readonly properties: {
      readonly dayPathId: string;
      readonly color: string;
      readonly opacity: number;
      readonly isHovered: boolean;
      readonly hoverProgress: number;
    };
    readonly geometry: {
      readonly type: "LineString";
      readonly coordinates: number[][];
    };
  }>;
};

export function toRoutesGeoJson(
  routes: readonly PlannerMapRoute[],
  hoverProgress: PlannerRouteHoverProgress,
): PlannerRoutesGeoJson {
  return {
    type: "FeatureCollection",
    features: routes.map((route) => ({
      type: "Feature",
      properties: {
        dayPathId: route.dayPathId,
        color: route.color,
        opacity: route.opacity,
        isHovered: route.isHovered,
        hoverProgress: hoverProgress.get(route.dayPathId) ?? (route.isHovered ? 1 : 0),
      },
      geometry: {
        type: "LineString",
        coordinates: route.coordinates.map((coordinate) => [...coordinate]),
      },
    })),
  };
}

export function syncRoutes(
  map: MapboxMap,
  routes: readonly PlannerMapRoute[],
  hoverProgress: PlannerRouteHoverProgress,
): void {
  const source = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
  source?.setData(toRoutesGeoJson(routes, hoverProgress));
}

function getRouteDayPathId(event: { readonly features?: readonly unknown[] }): string | null {
  const feature = event.features?.[0];
  if (!feature || typeof feature !== "object" || !("properties" in feature)) {
    return null;
  }

  const properties = feature.properties;
  if (!properties || typeof properties !== "object" || !("dayPathId" in properties)) {
    return null;
  }

  return typeof properties.dayPathId === "string" ? properties.dayPathId : null;
}

// 수정: 원본은 전역 view store를 직접 불렀다. 마커와 같은 이유로 handlers로 받는다
export function addRouteLayers(
  map: MapboxMap,
  hoveredMarkerRef: HoveredMarkerRef,
  handlers: PlannerMapHandlers,
): void {
  map.addSource(ROUTE_SOURCE_ID, {
    type: "geojson",
    data: toRoutesGeoJson([], new Map()),
  });
  map.addLayer({
    id: ROUTE_BORDER_LAYER_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#FFFFFF",
      "line-width": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "hoverProgress"], 0],
        0,
        8,
        1,
        10,
      ],
      "line-opacity": ["get", "opacity"],
    },
  });
  map.addLayer({
    id: ROUTE_LAYER_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": ["get", "color"],
      "line-width": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "hoverProgress"], 0],
        0,
        4,
        1,
        6,
      ],
      "line-opacity": ["get", "opacity"],
    },
  });
  // mouseenter가 아니라 mousemove를 구독. 마커에서 다시 선 위로 빠져나올 때
  // 지도는 여전히 선 안에 있다고 보아 mouseenter를 다시 쏘지 않기 때문
  map.on("mousemove", ROUTE_LAYER_ID, (event) => {
    map.getCanvas().style.cursor = "pointer";
    if (hoveredMarkerRef.current) {
      return;
    }

    const dayPathId = getRouteDayPathId(event);
    if (dayPathId && handlers.getHoveredItemId() !== dayPathId) {
      handlers.setHoveredItem(dayPathId);
    }
  });
  map.on("mouseleave", ROUTE_LAYER_ID, () => {
    map.getCanvas().style.cursor = "";
    const hoveredItemId = handlers.getHoveredItemId();
    if (hoveredItemId && handlers.isDayPathId(hoveredItemId)) {
      handlers.setHoveredItem(null);
    }
  });
  map.on("click", ROUTE_LAYER_ID, (event) => {
    const dayPathId = getRouteDayPathId(event);
    if (dayPathId) {
      handlers.activateItem(dayPathId);
    }
  });
}

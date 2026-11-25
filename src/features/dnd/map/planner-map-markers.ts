// 원본: trego-web-portfolio src/features/planner/map/planner-map-markers.ts
// 지도 마커의 DOM 생성과 갱신을 담당. React 밖에서 mapbox-gl을 직접 조작하는 계층

import mapboxgl, { type Map as MapboxMap } from "mapbox-gl";

import type { PlannerMapMarker } from "@/features/dnd/map/planner-map-model";
import type { PlannerNodePathId } from "@/features/dnd/stage-c/types/planner-node";

export const MARKER_PIN_RADIUS = 16;

export type RenderedMarker = {
  readonly marker: mapboxgl.Marker;
  readonly element: HTMLButtonElement;
  readonly label: HTMLSpanElement;
  readonly pin: HTMLSpanElement;
};

function createMarkerElement(): Omit<RenderedMarker, "marker"> {
  const element = document.createElement("button");
  element.type = "button";
  element.className =
    "pointer-events-auto cursor-pointer border-0 bg-transparent p-0 transition-opacity";

  const content = document.createElement("div");
  content.className = "flex flex-col items-center gap-1";

  const label = document.createElement("span");
  label.className =
    "max-w-40 truncate rounded bg-white/90 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap shadow-sm";

  const pin = document.createElement("span");
  pin.className =
    "flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md transition-transform duration-200";

  content.append(label, pin);
  element.append(content);
  return { element, label, pin };
}

function updateMarker(renderedMarker: RenderedMarker, markerModel: PlannerMapMarker): void {
  const isEmphasized = markerModel.isSelected || markerModel.isHovered;
  renderedMarker.marker.setLngLat([...markerModel.coordinate]);
  renderedMarker.element.style.opacity = String(markerModel.opacity);
  renderedMarker.element.style.zIndex = isEmphasized ? "10" : "0";
  renderedMarker.element.setAttribute("aria-label", `${markerModel.name} 일정 선택`);
  renderedMarker.label.textContent = markerModel.name;
  renderedMarker.label.style.color = markerModel.color;
  renderedMarker.pin.textContent = String(markerModel.number);
  renderedMarker.pin.style.backgroundColor = markerModel.color;
  renderedMarker.pin.style.transform = isEmphasized ? "scale(1.35)" : "scale(1)";
}

// 추가: 가까운 장소(공항·이호테우·동문시장)는 전체 일정 줌에서 라벨이 겹친다.
// 강조된 마커를 먼저, 나머지는 순서대로 두고, 앞서 둔 라벨·핀과 겹치는 라벨만 숨긴다. 핀은 항상 보인다.
export function hideOverlappingLabels(renderedMarkers: Map<string, RenderedMarker>): void {
  // 드래그 중 투명하게 빠진 마커는 자리를 차지하지 않는다
  const markers = [...renderedMarkers.values()]
    .filter(({ element }) => element.style.opacity !== "0")
    .sort(
    (a, b) => Number(b.element.style.zIndex || 0) - Number(a.element.style.zIndex || 0),
  );
  const pins = markers.map(({ pin }) => pin.getBoundingClientRect());
  const placed: DOMRect[] = [];
  const overlaps = (a: DOMRect, b: DOMRect) =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  markers.forEach(({ label }, i) => {
    const rect = label.getBoundingClientRect();
    const hidden =
      placed.some((other) => overlaps(rect, other)) ||
      pins.some((pin, j) => j !== i && overlaps(rect, pin));
    label.style.visibility = hidden ? "hidden" : "";
    if (!hidden) placed.push(rect);
  });
}

// 마커 엘리먼트는 canvas container의 자식이라 마커 위 포인터 이동도 지도까지 전달됨
// 마커 아래에 경로선이 깔려 있으면 지도가 그 선을 hover로 잡아 마커 hover를 덮어쓰므로,
// 마커를 가리키는 동안에는 경로선 hover를 건너뛰도록 현재 hover 중인 마커를 함께 추적
export type HoveredMarkerRef = { current: PlannerNodePathId | null };

// 수정: 원본은 일정 패널과 공유하는 전역 view store를 직접 불렀다.
// 데모의 세 트리는 각자 상태를 가지므로 지도가 쓰는 선택·hover만 콜백으로 받는다.
export type PlannerMapHandlers = {
  readonly activateItem: (pathId: PlannerNodePathId) => void;
  readonly getHoveredItemId: () => PlannerNodePathId | null;
  readonly setHoveredItem: (pathId: PlannerNodePathId | null) => void;
  readonly isDayPathId: (pathId: PlannerNodePathId) => boolean;
};

export function syncMarkers({
  map,
  markers,
  renderedMarkers,
  hoveredMarkerRef,
  handlers,
}: {
  readonly map: MapboxMap;
  readonly markers: readonly PlannerMapMarker[];
  readonly renderedMarkers: Map<string, RenderedMarker>;
  readonly hoveredMarkerRef: HoveredMarkerRef;
  readonly handlers: PlannerMapHandlers;
}): void {
  const activePathIds = new Set(markers.map((marker) => marker.pathId));

  renderedMarkers.forEach((renderedMarker, pathId) => {
    if (!activePathIds.has(pathId)) {
      if (hoveredMarkerRef.current === pathId) {
        hoveredMarkerRef.current = null;
      }
      renderedMarker.marker.remove();
      renderedMarkers.delete(pathId);
    }
  });

  markers.forEach((markerModel) => {
    let renderedMarker = renderedMarkers.get(markerModel.pathId);

    if (!renderedMarker) {
      const markerElement = createMarkerElement();
      markerElement.element.addEventListener("click", (event) => {
        // 마커 아래에 경로선이 깔려 있으면 지도 click까지 이어져 Day가 대신 선택됨
        event.stopPropagation();
        handlers.activateItem(markerModel.pathId);
      });
      markerElement.element.addEventListener("pointerenter", () => {
        hoveredMarkerRef.current = markerModel.pathId;
        handlers.setHoveredItem(markerModel.pathId);
      });
      markerElement.element.addEventListener("pointerleave", () => {
        if (hoveredMarkerRef.current === markerModel.pathId) {
          hoveredMarkerRef.current = null;
        }
        if (handlers.getHoveredItemId() === markerModel.pathId) {
          handlers.setHoveredItem(null);
        }
      });
      markerElement.element.addEventListener("pointerdown", (event) => event.stopPropagation());
      const marker = new mapboxgl.Marker({
        element: markerElement.element,
        anchor: "bottom",
        offset: [0, MARKER_PIN_RADIUS],
      })
        .setLngLat([...markerModel.coordinate])
        .addTo(map);
      renderedMarker = { marker, ...markerElement };
      renderedMarkers.set(markerModel.pathId, renderedMarker);
    }

    updateMarker(renderedMarker, markerModel);
  });
  hideOverlappingLabels(renderedMarkers);
}

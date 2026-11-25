// 원본: trego-web-portfolio src/features/planner/hooks/use-planner-map-instance.ts
// mapbox-gl 인스턴스의 명령형 생명주기를 한곳에 모음
// 생성·로드 판정·모델 반영·hover 보간이 같은 ref 묶음을 공유하므로 더 쪼개지 않음

import mapboxgl, { type Map as MapboxMap } from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildPlannerMapModel } from "@/features/dnd/map/build-planner-map-model";
import {
  applyInitialCamera,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  focusMap,
} from "@/features/dnd/map/planner-map-camera";
import {
  type PlannerMapHandlers,
  hideOverlappingLabels,
  type RenderedMarker,
  syncMarkers,
} from "@/features/dnd/map/planner-map-markers";
import { addRouteLayers, syncRoutes } from "@/features/dnd/map/planner-map-routes";
import {
  type PlannerRouteHoverProgress,
  stepPlannerRouteHoverProgress,
} from "@/features/dnd/map/planner-route-hover-progress";
import type { PlannerNodePathId, PlannerTree } from "@/features/dnd/stage-c/types/planner-node";

const MAP_STYLE = "mapbox://styles/mapbox/standard";
const MAP_LOAD_TIMEOUT_MS = 10_000;

export type PlannerMapLoadState = "loading" | "ready" | "error";

export type PlannerMapInstance = {
  readonly mapContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly mapLoadState: PlannerMapLoadState;
  readonly resetCamera: () => void;
  readonly retry: () => void;
};

// 수정: Day 숨김 토글(planner-map-store)은 데모에 없어 항상 빈 집합이다
const NO_HIDDEN_DAYS: ReadonlySet<PlannerNodePathId> = new Set();

// 수정: 원본은 tree·선택·hover·focus 요청을 전역 view store에서 읽었다. 데모에서는 tree를 인자로 받고,
// 선택·hover·focus 요청은 지도 안에서만 쓰는 로컬 상태로 둔다(트리 행과 지도 사이 hover 연동은 없음).
export function usePlannerMapInstance(
  accessToken: string | null | undefined,
  tree: PlannerTree,
  // 추가: 드래그 중 놓일 자리의 컨테이너. 바뀔 때마다 그 컨테이너의 장소로 카메라를 맞춘다(원본 requestMapMove fitBounds)
  dragFocusPathId: PlannerNodePathId | null = null,
): PlannerMapInstance {
  const [selectedItemId, setSelectedItemId] = useState<PlannerNodePathId | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<PlannerNodePathId | null>(null);
  const [mapFocusRequest, setMapFocusRequest] = useState<Readonly<{
    pathId: PlannerNodePathId;
  }> | null>(null);
  const hiddenDayIds = NO_HIDDEN_DAYS;
  const hoveredItemIdRef = useRef<PlannerNodePathId | null>(null);
  const treeRef = useRef(tree);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapLoadState, setMapLoadState] = useState<PlannerMapLoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const isLoadedRef = useRef(false);
  const hasAppliedInitialCameraRef = useRef(false);
  const lastHandledFocusRequestRef = useRef(mapFocusRequest);
  const renderedMarkersRef = useRef(new Map<string, RenderedMarker>());
  const hoveredMarkerRef = useRef<PlannerNodePathId | null>(null);
  const routeHoverProgressRef = useRef<PlannerRouteHoverProgress>(new Map());
  const mapModel = useMemo(
    () => buildPlannerMapModel({ tree, hiddenDayIds, selectedItemId, hoveredItemId }),
    [hiddenDayIds, hoveredItemId, selectedItemId, tree],
  );
  const mapModelRef = useRef(mapModel);
  const mapFocusRequestRef = useRef(mapFocusRequest);

  useEffect(() => {
    mapModelRef.current = mapModel;
    mapFocusRequestRef.current = mapFocusRequest;
    treeRef.current = tree;
  }, [mapFocusRequest, mapModel, tree]);

  // 원본 store의 activateItem·setHoveredItem 중 지도에 닿는 부분만 옮겼다
  const handlers = useMemo<PlannerMapHandlers>(
    () => ({
      activateItem(pathId) {
        if (!treeRef.current.entityMap.has(pathId)) {
          return;
        }
        setSelectedItemId(pathId);
        setMapFocusRequest({ pathId });
      },
      getHoveredItemId: () => hoveredItemIdRef.current,
      setHoveredItem(pathId) {
        hoveredItemIdRef.current = pathId;
        setHoveredItemId(pathId);
      },
      isDayPathId: (pathId) => treeRef.current.entityMap.get(pathId)?.kind === "day",
    }),
    [],
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !accessToken) {
      return;
    }

    setMapLoadState("loading");
    let map: MapboxMap;
    try {
      map = new mapboxgl.Map({
        accessToken,
        container,
        style: MAP_STYLE,
        config: { basemap: { lightPreset: "day" } },
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        // 수정: 원본은 화면 전체가 지도라 휠이 곧 확대였다. 스크롤하는 글 안에 끼운 데모라
        // 휠은 페이지 스크롤에 양보하고 Ctrl/⌘+휠, 두 손가락으로만 지도를 움직인다
        cooperativeGestures: true,
      });
    } catch {
      const constructorErrorTimeoutId = window.setTimeout(() => {
        setMapLoadState("error");
      }, 0);
      return () => {
        window.clearTimeout(constructorErrorTimeoutId);
      };
    }

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    const renderedMarkers = renderedMarkersRef.current;
    mapRef.current = map;
    let isDisposed = false;
    let hasInitialLoadFailed = false;
    let loadTimeoutId = window.setTimeout(() => {
      if (!isDisposed && !isLoadedRef.current) {
        hasInitialLoadFailed = true;
        setMapLoadState("error");
      }
    }, MAP_LOAD_TIMEOUT_MS);

    const clearLoadTimeout = () => {
      window.clearTimeout(loadTimeoutId);
      loadTimeoutId = 0;
    };

    const handleLoad = () => {
      if (hasInitialLoadFailed) {
        return;
      }

      clearLoadTimeout();
      isLoadedRef.current = true;
      setMapLoadState("ready");
      addRouteLayers(map, hoveredMarkerRef, handlers);
      syncRoutes(map, mapModelRef.current.routes, routeHoverProgressRef.current);
      syncMarkers({
        map,
        markers: mapModelRef.current.markers,
        renderedMarkers,
        hoveredMarkerRef,
        handlers,
      });
      hasAppliedInitialCameraRef.current = applyInitialCamera(map, mapModelRef.current);
      const focusRequest = mapFocusRequestRef.current;
      const focus = mapModelRef.current.focus;
      if (focusRequest && focus?.pathId === focusRequest.pathId) {
        focusMap(map, focus);
      }
      lastHandledFocusRequestRef.current = mapFocusRequestRef.current;
    };

    const handleError = () => {
      if (isLoadedRef.current || hasInitialLoadFailed) {
        return;
      }

      clearLoadTimeout();
      hasInitialLoadFailed = true;
      setMapLoadState("error");
    };

    map.on("load", handleLoad);
    map.on("error", handleError);
    // 확대·이동하면 라벨 간격이 바뀌므로 겹침을 다시 판정한다
    const handleMove = () => hideOverlappingLabels(renderedMarkers);
    map.on("move", handleMove);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            map.resize();
          });
    resizeObserver?.observe(container);

    return () => {
      isDisposed = true;
      clearLoadTimeout();
      resizeObserver?.disconnect();
      renderedMarkers.forEach(({ marker }) => {
        marker.remove();
      });
      renderedMarkers.clear();
      map.remove();
      // 수정: cooperativeGestures가 컨테이너에 붙인 안내 요소(scroll-zoom-blocker 등)는 map.remove()가 지우지 않는다.
      // 남겨 두면 StrictMode 재마운트나 다시 시도 때 "map container element should be empty" 경고가 난다
      container.replaceChildren();
      mapRef.current = null;
      isLoadedRef.current = false;
      hasAppliedInitialCameraRef.current = false;
      lastHandledFocusRequestRef.current = null;
    };
  }, [accessToken, handlers, retryCount]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) {
      return;
    }

    syncMarkers({
      map,
      markers: mapModel.markers,
      renderedMarkers: renderedMarkersRef.current,
      hoveredMarkerRef,
      handlers,
    });

    if (!hasAppliedInitialCameraRef.current) {
      hasAppliedInitialCameraRef.current = applyInitialCamera(map, mapModel);
    }

    if (!mapFocusRequest || lastHandledFocusRequestRef.current === mapFocusRequest) {
      return;
    }

    if (mapModel.focus?.pathId === mapFocusRequest.pathId) {
      focusMap(map, mapModel.focus);
    }
    lastHandledFocusRequestRef.current = mapFocusRequest;
  }, [handlers, mapFocusRequest, mapModel]);

  // 드래그 중 카메라. 잡은 장소가 이미 미리 끼워진 모델이라 놓일 컨테이너의 장소를 모두 담는다
  useEffect(() => {
    const map = mapRef.current;
    if (!dragFocusPathId || !map || !isLoadedRef.current) {
      return;
    }

    const coordinates = mapModelRef.current.markers
      .filter((marker) => marker.containerPathId === dragFocusPathId)
      .map((marker) => marker.coordinate);
    if (coordinates.length > 0) {
      focusMap(map, { pathId: dragFocusPathId, kind: "bounds", coordinates });
    }
  }, [dragFocusPathId, mapLoadState]);

  // hover 굵기를 프레임마다 보간해 넣음. 첫 반영은 동기로 처리해 색·표시 여부는 즉시 맞춤
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) {
      return;
    }

    const applyStep = (elapsedMs: number): boolean => {
      const { progress, isSettled } = stepPlannerRouteHoverProgress(
        routeHoverProgressRef.current,
        mapModel.routes,
        elapsedMs,
      );
      routeHoverProgressRef.current = progress;
      syncRoutes(map, mapModel.routes, progress);
      return isSettled;
    };

    if (applyStep(0)) {
      return;
    }

    let frame = 0;
    let previousTime: number | null = null;
    const step = (time: number) => {
      const elapsedMs = previousTime === null ? 0 : time - previousTime;
      previousTime = time;
      if (!applyStep(elapsedMs)) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [mapLoadState, mapModel.routes]);

  const resetCamera = useCallback((): void => {
    const map = mapRef.current;
    if (map && isLoadedRef.current) {
      applyInitialCamera(map, mapModelRef.current);
    }
  }, []);

  const retry = useCallback((): void => {
    setMapLoadState("loading");
    setRetryCount((count) => count + 1);
  }, []);

  return { mapContainerRef, mapLoadState, resetCamera, retry };
}

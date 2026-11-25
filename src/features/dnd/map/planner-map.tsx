// 원본: trego-web-portfolio src/features/planner/components/planner-map.tsx
// 지도 영역의 화면 상태만 담당
// mapbox-gl 인스턴스와 마커·경로 갱신은 usePlannerMapInstance와 dnd/map 모듈이 소유

"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { MapPinned, Scan } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlannerMapInstance } from "@/features/dnd/map/use-planner-map-instance";
import type { PlannerTree } from "@/features/dnd/stage-c/types/planner-node";

// 수정: 원본은 토큰이 없으면 안내 문구를 띄웠다. 데모는 토큰이 있을 때만 이 컴포넌트를 쓰고,
// 없으면 route-map.tsx의 SVG 지도로 대신한다. 모듈 패널 열기 버튼은 패널이 없어 뺐다.
export function PlannerMap({
  accessToken,
  tree,
  dragFocusPathId = null,
}: {
  readonly accessToken: string;
  readonly tree: PlannerTree;
  readonly dragFocusPathId?: string | null;
}) {
  const { mapContainerRef, mapLoadState, resetCamera, retry } = usePlannerMapInstance(accessToken, tree, dragFocusPathId);

  return (
    // 원본처럼 남는 자리를 채운다(홈 앱 창의 지도 칸)
    <section aria-label="지도 영역" className="relative h-full min-w-0 overflow-hidden bg-[#eef1f3]">
      <div className="absolute inset-0">
        <div ref={mapContainerRef} data-testid="planner-map-canvas" className="h-full w-full" />
      </div>
      {mapLoadState === "loading" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#eef1f3]/85 p-8">
          {/* 지도는 처음 한 번만 만들어진다. 보통 1초 안에 뜨므로 그동안은 문구 없이 바탕색만 둔다 */}
          <p role="status" className="text-sm font-medium text-muted-foreground animate-in fade-in fill-mode-backwards delay-1000">
            지도를 불러오는 중입니다
          </p>
        </div>
      ) : null}
      {mapLoadState === "error" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#eef1f3]/95 p-8">
          <div role="alert" className="max-w-sm rounded-xl border bg-card p-5 text-center shadow-sm">
            <MapPinned aria-hidden="true" className="mx-auto mb-3 size-7" />
            <p className="font-semibold">지도를 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">토큰과 네트워크 연결을 확인한 뒤 다시 시도해 주세요.</p>
            <Button type="button" variant="secondary" className="mt-4" onClick={retry}>
              지도 다시 시도
            </Button>
          </div>
        </div>
      ) : null}
      {mapLoadState === "ready" ? (
        <div className="absolute top-3 right-12 z-10">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            title="전체 일정 보기"
            aria-label="전체 일정 보기"
            className="shadow-sm"
            onClick={resetCamera}
          >
            <Scan aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

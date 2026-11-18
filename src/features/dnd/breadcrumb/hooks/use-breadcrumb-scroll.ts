// breadcrumb 기준 행을 정하는 Trego usePlannerScheduleScroll에서 선택 행 스크롤(스토어 의존)만 뺀 것

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { DND_ROW_HEIGHT } from "@/features/dnd/shared/row-metrics";
import type { FlattenedPlannerNode } from "@/features/dnd/stage-c/types/planner-node";

export function useBreadcrumbScroll({
  items,
  getItemElement,
}: {
  items: readonly FlattenedPlannerNode[];
  getItemElement: (pathId: string) => HTMLElement | null;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [topItemId, setTopItemId] = useState<string | null>(null);

  const updateTopItem = useCallback((): void => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const breadcrumbBottom =
      // breadcrumb이 맨 위에 붙어 있으므로 아랫변은 컨테이너 위에서 행 높이 하나만큼
      scrollContainer.getBoundingClientRect().top + DND_ROW_HEIGHT;
    let next: string | null = null;

    // 행 라벨은 breadcrumb 아래로 완전히 들어가는 순간 사라짐
    // 그 순간 다음 행이 breadcrumb 아랫변에 닿으므로, 그 행의 조상을 보여 주면 사라진 라벨이 곧바로 나타남
    for (const item of items) {
      const top = getItemElement(item.pathId)?.getBoundingClientRect().top;
      // 원본은 행(36px)이 breadcrumb(32px)보다 커서 `>`였음. 여기는 breadcrumb과 행이 둘 다 30px라 스크롤 0에서 두 번째 행이 경계에 정확히 닿으므로 `>=`
      if (top === undefined || top >= breadcrumbBottom) break;
      next = item.pathId;
    }

    setTopItemId((current) => (current === next ? current : next));
  }, [getItemElement, items]);

  useLayoutEffect(() => {
    updateTopItem();
  }, [updateTopItem]);

  return { scrollContainerRef, topItemId, updateTopItem };
}

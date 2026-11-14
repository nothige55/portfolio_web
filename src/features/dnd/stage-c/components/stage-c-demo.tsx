"use client";

import { useEffect, useMemo } from "react";

import { DemoFrame } from "@/features/dnd/components/demo-frame";
import { PlannerSchedulePanel } from "@/features/dnd/stage-c/components/planner-schedule-panel";
import { usePlannerViewStore } from "@/features/dnd/stage-c/stores/planner-view-store";

export function StageCDemo() {
  const flattenedItems = usePlannerViewStore((state) => state.tree.flattenedItems);
  const reset = usePlannerViewStore((state) => state.reset);
  // store는 모듈에 하나라서 페이지를 떠나도 남는다. V1~V4처럼 돌아오면 처음 상태이도록 떠날 때 비운다
  useEffect(() => reset, [reset]);
  // 원본은 여행 시작일로 Day 번호를 매겼다. 데모는 화면 순서대로 1부터 매긴다
  const dayNumberByPathId = useMemo(() => {
    const numbers = new Map<string, number>();
    for (const node of flattenedItems) {
      if (node.kind === "day") numbers.set(node.pathId, numbers.size + 1);
    }
    return numbers;
  }, [flattenedItems]);

  return (
    <DemoFrame onReset={reset}>
      <PlannerSchedulePanel dayNumberByPathId={dayNumberByPathId} />
    </DemoFrame>
  );
}

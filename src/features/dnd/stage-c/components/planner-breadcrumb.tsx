// 스크롤 기준 행의 조상 경로를 목록 상단에 고정해 보여 주는 breadcrumb
// 높이 상수는 usePlannerScheduleScroll이 기준 행을 고르는 경계선으로도 씀
// trego-web-portfolio planner-breadcrumb.tsx에서 가져옴. 달라진 곳은 "수정:"으로 표시

import { DND_ROW_HEIGHT } from "@/features/dnd/shared/row-metrics";
import { PlannerNodeLabel } from "@/features/dnd/stage-c/components/planner-node-label";
import type {
  FlattenedPlannerNode,
  PlannerNodePathId,
} from "@/features/dnd/stage-c/types/planner-node";

type PlannerBreadcrumbProps = {
  readonly ancestors: readonly FlattenedPlannerNode[];
  readonly dayNumberByPathId: ReadonlyMap<PlannerNodePathId, number>;
  readonly entityMap: ReadonlyMap<PlannerNodePathId, FlattenedPlannerNode>;
};

// 일정 도구 막대(h-8) 바로 아래에 붙으므로 sticky top도 32px
export const PLANNER_BREADCRUMB_TOP = 32;
// 수정: 원본 32px → 행 높이 30px. 원본은 행(36px)이 breadcrumb(32px)보다 커서 첫 행이 처음부터 가려지는 일이 없었다.
// 데모 행은 30px이라 32px breadcrumb면 스크롤 0에서 이미 둘째 행이 아랫변을 넘어 첫 행(펼침 버튼 포함)을 덮는다
export const PLANNER_BREADCRUMB_HEIGHT = DND_ROW_HEIGHT;

export function PlannerBreadcrumb({
  ancestors,
  dayNumberByPathId,
  entityMap,
}: PlannerBreadcrumbProps) {
  if (ancestors.length === 0) {
    // 일정 헤더가 이 공간을 덮음. 항상 같은 높이를 유지해 breadcrumb 전환 시 목록이 흔들리지 않음
    return (
      <div
        aria-hidden="true"
        data-testid="planner-breadcrumb-placeholder"
        className="sticky -top-px z-40 h-8 w-full"
      />
    );
  }

  return (
    // 수정: 높이 h-8 → h-[30px](PLANNER_BREADCRUMB_HEIGHT). 자리 맡기(h-8)와 흐름 높이를 같게 두려고 위 여백 2px(mt-0.5)를 줬다.
    // sticky top은 테두리 기준이라 상자는 도구 막대 바로 아래 32~62px에 붙는다
    // 수정: 왼쪽 여백 22px → 20px. 원본 행은 드롭 표시선 2px + 펼침 칸 20px였고,
    // 데모 행은 펼침 칸을 18px로 줄여(row-metrics 통일) 라벨이 x=20에서 시작한다. 행 라벨과 같은 x에 맞춘다
    <nav
      aria-label="현재 일정 경로"
      className="pointer-events-none sticky top-8 z-40 mt-0.5 flex h-[30px] w-full items-center gap-1 overflow-hidden bg-card pr-5 pl-5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']"
    >
      {ancestors.map((ancestor, index) => (
        <div key={ancestor.pathId} className="flex min-w-0 shrink-0 items-center gap-1">
          <PlannerNodeLabel
            node={ancestor}
            parent={ancestor.parentPathId ? entityMap.get(ancestor.parentPathId) : undefined}
            dayNumber={dayNumberByPathId.get(ancestor.pathId)}
            titleClassName="max-w-24"
          />
          {index < ancestors.length - 1 ? (
            <span aria-hidden="true" className="text-sm leading-none text-muted-foreground">
              /
            </span>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

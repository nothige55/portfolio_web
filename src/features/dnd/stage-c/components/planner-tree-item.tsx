// 일정 트리의 행 하나를 그림
// 원본에서 드롭 상태 표현과 펼침만 남기고, 선택·hover·이름/메모 편집·컨텍스트 메뉴·지도 토글은 뺐다

import { useSortable } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback } from "react";

import { PlannerNodeLabel } from "@/features/dnd/stage-c/components/planner-node-label";
import { PLANNER_ROUTE_INFO_HEIGHT } from "@/features/dnd/stage-c/components/planner-route-info";
import { usePlannerViewStore } from "@/features/dnd/stage-c/stores/planner-view-store";
import type {
  FlattenedPlannerNode,
  PlannerNodePathId,
} from "@/features/dnd/stage-c/types/planner-node";
import { getPlannerRowIndentation } from "@/features/dnd/stage-c/utils/get-planner-row-indentation";

const PLANNER_ROW_SURFACE_CLASS_NAME = "border-l-2 transition-colors";

export function PlannerTreeItem({
  node,
  dayNumber,
  registerItem,
  routeInfo,
  dragRouteInfo,
  dragOffset,
  isDropTargetVisible,
  isChildTarget,
  isExpandingTarget,
}: {
  readonly node: FlattenedPlannerNode;
  readonly dayNumber?: number;
  // 렌더마다 새 함수가 오면 ref가 떨어졌다 붙어 dnd-kit이 droppable을 다시 잼
  // pathId와 함께 부르는 고정 함수를 받아 이 안에서 안정된 콜백으로 묶음
  readonly registerItem: (pathId: PlannerNodePathId, element: HTMLDivElement | null) => void;
  // 평상시 행 머리에 붙는 경로 정보 칸. 노드의 히트박스에는 들어가지 않음
  // 드래그 중에는 레이아웃 높이만 지키는 빈 칸으로 남고, 내용은 dragRouteInfo가 그림
  readonly routeInfo?: ReactNode;
  // 드래그 중 경로 정보. 노드 박스 바로 위에 겹쳐 그려 노드와 함께 옮겨 가고,
  // 레이아웃 높이에는 영향을 주지 않음
  readonly dragRouteInfo?: ReactNode;
  // 드래그 중 노드 박스를 옮길 거리. 지금 놓았을 때의 배치에서 계산
  readonly dragOffset: number;
  // 놓을 자리가 있을 때만 빈 자리를 표시. 목록 밖에서는 빠진 것처럼 보여야 함
  readonly isDropTargetVisible: boolean;
  readonly isChildTarget: boolean;
  readonly isExpandingTarget: boolean;
}) {
  const entityMap = usePlannerViewStore((state) => state.tree.entityMap);
  const childrenMap = usePlannerViewStore((state) => state.tree.childrenMap);
  const expandedIds = usePlannerViewStore((state) => state.expandedIds);
  const toggleExpanded = usePlannerViewStore((state) => state.toggleExpanded);
  // 밀림은 dnd-kit의 정렬 전략이 아니라 패널이 계산한 dragOffset으로 그림
  // 경로 정보 칸이 드래그 도중 생기거나 사라지는 걸 전략은 모르기 때문
  const { attributes, isDragging, listeners, setNodeRef } = useSortable({ id: node.pathId });
  const hasChildren = (childrenMap.get(node.pathId) ?? []).length > 0;
  const isExpanded = expandedIds.has(node.pathId);
  // 별도의 20px 토글 칸을 항상 유지해 자식 유무와 관계없이 라벨 시작점을 맞춤
  const indentation = getPlannerRowIndentation(node.depth);
  // 렌더마다 새 ref 함수가 가면 노드가 떨어졌다 붙어 dnd-kit이 droppable을 다시 잼
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      setNodeRef(element);
      registerItem(node.pathId, element);
    },
    [node.pathId, registerItem, setNodeRef],
  );
  return (
    <li
      {...attributes}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={false}
      data-drop-state={isChildTarget ? "child" : isExpandingTarget ? "expanding" : undefined}
      className="list-none"
    >
      {routeInfo}
      {/* 잡는 단위이자 충돌 rect. 경로 정보를 뺀 라벨만 여기에 들어감 */}
      <div
        ref={setRefs}
        {...listeners}
        data-planner-node=""
        className="relative cursor-grab touch-none active:cursor-grabbing"
        style={{
          // transform은 dnd-kit이 재는 이 요소에 직접 걸어 둠. 부모(li)에 걸면 다시 잴 때
          // 그 이동량이 rect에 섞임(ignoreTransform은 잰 요소 자신의 것만 되돌림)
          transform: dragOffset ? `translate3d(0, ${dragOffset}px, 0)` : undefined,
          // 잡고 있는 동안에는 원래 자리를 비우되 높이는 유지
          // visibility는 상속되므로 아래 placeholder만 다시 켜서 빈 자리를 표시
          visibility: isDragging ? "hidden" : undefined,
        }}
      >
        {dragRouteInfo ? (
          <div
            className="pointer-events-none visible absolute inset-x-0 bottom-full"
            style={{ height: PLANNER_ROUTE_INFO_HEIGHT }}
          >
            {dragRouteInfo}
          </div>
        ) : null}
        {isDragging && isDropTargetVisible ? (
          <div
            aria-hidden="true"
            data-testid="planner-drag-placeholder"
            className="visible absolute inset-0 rounded-md border border-dashed border-brand/40 bg-brand/5"
          />
        ) : null}
        <div
          className={`group flex h-9 items-center text-foreground ${PLANNER_ROW_SURFACE_CLASS_NAME} ${
            isChildTarget
              ? "planner-child-drop-fill border-brand"
              : isExpandingTarget
                ? "border-brand/60 bg-brand/5"
                : "border-transparent hover:bg-muted/70"
          }`}
          style={{ paddingLeft: indentation }}
        >
          <span className="flex h-9 w-5 shrink-0 items-center justify-center">
            {hasChildren ? (
              <button
                type="button"
                aria-label={`${node.name} ${isExpanded ? "접기" : "펼치기"}`}
                className="flex h-9 w-5 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node.pathId);
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {isExpanded ? (
                  <ChevronDown aria-hidden="true" className="size-4" />
                ) : (
                  <ChevronRight aria-hidden="true" className="size-4" />
                )}
              </button>
            ) : null}
          </span>
          <PlannerNodeLabel
            node={node}
            dayNumber={dayNumber}
            parent={node.parentPathId ? entityMap.get(node.parentPathId) : undefined}
            className="flex-1 py-2.5 pr-2"
          />
        </div>
      </div>
    </li>
  );
}

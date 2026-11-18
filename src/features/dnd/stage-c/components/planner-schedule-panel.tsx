// 일정 트리를 조합하고, 드래그 중 행을 옮기는 데 필요한 측정값(행 ref, 노드 높이)을 소유
// 원본 패널에서 드래그와 무관한 헤더·선택·편집·단축키는 뺐다
// 툴바(제목 줄)·breadcrumb·스크롤 추적은 원본 그대로 가져왔다. 달라진 곳은 "수정:"으로 표시

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PlannerBreadcrumb } from "@/features/dnd/stage-c/components/planner-breadcrumb";
import { PlannerDragPreview } from "@/features/dnd/stage-c/components/planner-drag-preview";
import { PlannerScheduleToolbar } from "@/features/dnd/stage-c/components/planner-schedule-toolbar";
import { PlannerTreeItem } from "@/features/dnd/stage-c/components/planner-tree-item";
import { calculatePlannerDragFootprintHeight } from "@/features/dnd/stage-c/dnd/resolve-planner-drop";
import { usePlannerDragAndDrop } from "@/features/dnd/stage-c/dnd/use-planner-drag-and-drop";
import { usePlannerScheduleScroll } from "@/features/dnd/stage-c/hooks/use-planner-schedule-scroll";
import { usePlannerViewStore } from "@/features/dnd/stage-c/stores/planner-view-store";
import type { PlannerNodePathId } from "@/features/dnd/stage-c/types/planner-node";
import {
  buildPlannerDragVisualOrder,
  calculatePlannerDragOffsets,
} from "@/features/dnd/stage-c/utils/build-planner-drag-layout";
import { buildPlannerDragProjection } from "@/features/dnd/stage-c/utils/build-planner-drag-projection";
import { getPlannerBreadcrumbAncestors } from "@/features/dnd/stage-c/utils/get-planner-breadcrumb-ancestors";
import { getPlannerRowAdornments } from "@/features/dnd/stage-c/utils/get-planner-row-adornments";
import { getVisiblePlannerNodes } from "@/features/dnd/stage-c/utils/get-visible-planner-nodes";

export function PlannerSchedulePanel({
  dayNumberByPathId,
}: {
  readonly dayNumberByPathId: ReadonlyMap<PlannerNodePathId, number>;
}) {
  const tree = usePlannerViewStore((state) => state.tree);
  const rootPathId = usePlannerViewStore((state) => state.rootPathId);
  const expandedIds = usePlannerViewStore((state) => state.expandedIds);
  const expandNode = usePlannerViewStore((state) => state.expandNode);
  const moveNode = usePlannerViewStore((state) => state.moveNode);
  const itemRefs = useRef(new Map<PlannerNodePathId, HTMLDivElement>());
  const registerItem = useCallback(
    (pathId: PlannerNodePathId, element: HTMLDivElement | null): void => {
      if (element) {
        itemRefs.current.set(pathId, element);
      } else {
        itemRefs.current.delete(pathId);
      }
    },
    [],
  );
  const getItemElement = useCallback(
    (pathId: PlannerNodePathId): HTMLDivElement | null => itemRefs.current.get(pathId) ?? null,
    [],
  );
  // 자리는 li 기준으로 잼
  const getItemBlockHeight = useCallback((pathId: PlannerNodePathId): number => {
    const element = itemRefs.current.get(pathId);
    if (!element) {
      return 0;
    }

    return element.parentElement?.offsetHeight ?? element.offsetHeight;
  }, []);
  const [dragFootprintHeight, setDragFootprintHeight] = useState(0);
  // 드래그 시작 때 잰 노드 박스 높이. 밀림 거리를 이 값으로 계산
  // offsetHeight는 transform과 무관해 드래그 중에도 바뀌지 않음
  const [dragNodeHeights, setDragNodeHeights] = useState<ReadonlyMap<PlannerNodePathId, number>>(
    () => new Map(),
  );
  const visibleItems = useMemo(
    () => getVisiblePlannerNodes(tree.flattenedItems, expandedIds, tree.childrenMap),
    [expandedIds, tree.childrenMap, tree.flattenedItems],
  );
  // root는 프로젝트 컨테이너이므로 탐색 순서에는 사용하되 목록에서는 숨김
  const renderedItems = useMemo(
    () => visibleItems.filter((item) => item.pathId !== rootPathId),
    [rootPathId, visibleItems],
  );
  const { scrollContainerRef, topItemId, updateTopItem } = usePlannerScheduleScroll({
    items: renderedItems,
    getItemElement,
  });
  const {
    activePathId,
    childTargetPathId,
    dropDestination,
    expandingTargetPathId,
    handleDragCancel,
    handleDragEnd,
    handleDragMove,
    handleDragStart,
    isOutsideList,
    isSiblingDropActive,
    sensors,
    sortableItems,
  } = usePlannerDragAndDrop({
    tree,
    rootPathId,
    visibleItems: renderedItems,
    expandedIds,
    expandNode,
    getListBounds: useCallback(() => {
      const rect = scrollContainerRef.current?.getBoundingClientRect();
      return rect ? { left: rect.left, right: rect.right } : null;
    }, [scrollContainerRef]),
    moveNode,
  });
  const handlePanelDragStart = (event: DragStartEvent): void => {
    const pathId = String(event.active.id);
    setDragNodeHeights(
      new Map(
        [...itemRefs.current].map(([itemPathId, element]) => [itemPathId, element.offsetHeight]),
      ),
    );
    setDragFootprintHeight(
      calculatePlannerDragFootprintHeight(renderedItems, pathId, getItemBlockHeight),
    );
    handleDragStart(event);
  };
  const handlePanelDragMove = (event: DragMoveEvent): void => {
    // 드래그 중에 펼쳐져 새로 그려진 행은 시작 때 재지 못했으니 여기서 채움
    const additions: [PlannerNodePathId, number][] = [];
    for (const [itemPathId, element] of itemRefs.current) {
      if (!dragNodeHeights.has(itemPathId)) {
        additions.push([itemPathId, element.offsetHeight]);
      }
    }
    if (additions.length > 0) {
      setDragNodeHeights((previous) => new Map([...previous, ...additions]));
    }
    handleDragMove(event);
  };
  const handlePanelDragEnd = (event: DragEndEvent): void => {
    setDragFootprintHeight(0);
    setDragNodeHeights(new Map());
    handleDragEnd(event);
  };
  const handlePanelDragCancel = (): void => {
    setDragFootprintHeight(0);
    setDragNodeHeights(new Map());
    handleDragCancel();
  };
  const activeNode = activePathId ? tree.entityMap.get(activePathId) : undefined;
  // 드래그 중에는 목록이 "지금 놓으면" 보일 모습으로 그림
  // - 목록 밖: 잡은 노드를 빼고 구멍 없이 닫힌 일정
  // - 형제 사이 자리: 잡은 노드를 그 자리에 끼운 일정
  // - 그 밖(받아 주지 않는 자리, 컨테이너 안으로 넣는 중): 아무것도 옮기지 않음
  const dragLayout = useMemo(() => {
    if (!activePathId || (!isOutsideList && !(isSiblingDropActive && dropDestination))) {
      return null;
    }

    const projection = buildPlannerDragProjection({
      tree,
      activePathId,
      destination: isOutsideList ? null : dropDestination,
    });
    const visualRows = projection
      ? buildPlannerDragVisualOrder({
          rows: sortableItems,
          activePathId,
          projection,
          rootPathId,
          expandedIds,
        })
      : null;
    return projection && visualRows ? { projection, visualRows } : null;
  }, [
    activePathId,
    dropDestination,
    expandedIds,
    isOutsideList,
    isSiblingDropActive,
    rootPathId,
    sortableItems,
    tree,
  ]);
  const rowAdornments = useMemo(
    () =>
      new Map(
        sortableItems.map((node, index) => [
          node.pathId,
          getPlannerRowAdornments({
            node,
            nextNode: sortableItems[index + 1],
            tree,
            rootPathId,
            topItemId,
            isDragging: activePathId !== null,
          }),
        ]),
      ),
    [activePathId, rootPathId, sortableItems, topItemId, tree],
  );
  // 레이아웃 높이는 그대로 두고 노드 박스만 옮김. dnd-kit이 시작 때 잰 rect가 끝까지 유효함
  const dragOffsets = useMemo(
    () =>
      dragLayout
        ? calculatePlannerDragOffsets({
            layoutRows: sortableItems,
            visualRows: dragLayout.visualRows,
            getNodeHeight: (pathId) => dragNodeHeights.get(pathId) ?? 0,
          })
        : null,
    [dragLayout, dragNodeHeights, sortableItems],
  );
  // 다음 최상위 구간이 breadcrumb 아랫변에 닿으면 그 행은 조상이 없으므로 breadcrumb도 비워짐
  // 그 자리는 앞 행에 붙는 이전 구간 라벨(boundaryAncestor)이 이어받음
  const breadcrumbAncestors = useMemo(
    () => getPlannerBreadcrumbAncestors(topItemId, rootPathId, tree.entityMap),
    [rootPathId, topItemId, tree.entityMap],
  );

  return (
    // 수정: 원본 패널은 화면 높이를 채우고 그 안에서 목록이 스크롤된다. 데모는 카드 안에 놓이므로
    // 목록 영역 높이를 400px로 고정해 일정 끝부분이 스크롤되게 한다(펼친 일정 전체는 약 470px).
    // 처음 화면에서 과제(8/14 동문시장 → 8/12)의 두 행이 모두 보이는 높이다
    <div className="relative h-[400px]">
      <PlannerScheduleToolbar />
      {/* 수정: 원본의 scrollbar-hide 유틸리티는 이 저장소 globals.css에 없어 같은 속성을 클래스로 직접 씀 */}
      <div
        ref={scrollContainerRef}
        data-testid="planner-schedule-scroll-area"
        className="h-full overflow-y-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={updateTopItem}
      >
        <PlannerBreadcrumb
          ancestors={breadcrumbAncestors}
          dayNumberByPathId={dayNumberByPathId}
          entityMap={tree.entityMap}
        />
        {/* over는 포인터가 멈춰 있어도 리렌더로 다시 계산되는데 onDragMove는 그때
            불리지 않음. 그것만 물면 밀림이 한 프레임 뒤처져 화면
            순서와 어긋남. onDragOver는 over가 바뀌는 시점에 setOver와 같은
            배치로 불리므로 둘 다 같은 핸들러를 씀 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragCancel={handlePanelDragCancel}
          onDragEnd={handlePanelDragEnd}
          onDragMove={handlePanelDragMove}
          onDragOver={handlePanelDragMove}
          onDragStart={handlePanelDragStart}
        >
          {/* 밀림은 전략이 내는 transform이 아니라 dragOffsets로 그림. 전략은 잡은 노드를
              목록에서 빼고 보일 순서를 다시 짜는 이 데모의 배치를 모르기 때문. 전략은
              목록 모양에 맞는 세로 목록 전략으로 두되, 화면에는 쓰지 않음 */}
          <SortableContext
            items={sortableItems.map((node) => node.pathId)}
            strategy={verticalListSortingStrategy}
          >
            <ul role="tree" aria-label="여행 일정" className="min-h-full outline-none">
              {sortableItems.map((node) => {
                const { boundaryAncestor } = rowAdornments.get(node.pathId)!;

                return (
                  <PlannerTreeItem
                    key={node.pathId}
                    node={node}
                    boundaryAncestor={boundaryAncestor}
                    dragOffset={dragOffsets?.get(node.pathId) ?? 0}
                    dayNumber={dayNumberByPathId.get(node.pathId)}
                    isDropTargetVisible={!isOutsideList}
                    isChildTarget={childTargetPathId === node.pathId}
                    isExpandingTarget={expandingTargetPathId === node.pathId}
                    registerItem={registerItem}
                  />
                );
              })}
            </ul>
          </SortableContext>
          {/* 수정: DragOverlay도 fixed라서 transform 조상 안에서는 어긋난다. body로 내보낸다 */}
          {activeNode
            ? createPortal(
                <DragOverlay>
                  <PlannerDragPreview
                    node={activeNode}
                    dayNumber={dayNumberByPathId.get(activeNode.pathId)}
                  />
                </DragOverlay>,
                document.body,
              )
            : null}
        </DndContext>
        <div
          aria-hidden="true"
          data-testid="planner-drag-footprint-spacer"
          style={{ height: dragFootprintHeight }}
        />
      </div>
    </div>
  );
}

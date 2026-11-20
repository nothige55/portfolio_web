// 일정 트리를 조합하고, 드래그 중 행을 옮기는 데 필요한 측정값(행 ref, 노드 높이)을 소유
// 원본 패널에서 드래그와 무관한 헤더·툴바·breadcrumb·선택·편집·단축키·스크롤 추적은 뺐다

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PlannerDragPreview } from "@/features/dnd/stage-c/components/planner-drag-preview";
import { PlannerTreeItem } from "@/features/dnd/stage-c/components/planner-tree-item";
import { calculatePlannerDragFootprintHeight } from "@/features/dnd/stage-c/dnd/resolve-planner-drop";
import { usePlannerDragAndDrop } from "@/features/dnd/stage-c/dnd/use-planner-drag-and-drop";
import type { DragPreview } from "@/features/dnd/data/route-rows";
import { usePlannerViewStore } from "@/features/dnd/stage-c/stores/planner-view-store";
import type { PlannerNodePathId } from "@/features/dnd/stage-c/types/planner-node";
import {
  buildPlannerDragVisualOrder,
  calculatePlannerDragOffsets,
} from "@/features/dnd/stage-c/utils/build-planner-drag-layout";
import { buildPlannerDragProjection } from "@/features/dnd/stage-c/utils/build-planner-drag-projection";
import { getVisiblePlannerNodes } from "@/features/dnd/stage-c/utils/get-visible-planner-nodes";

export function PlannerSchedulePanel({
  dayNumberByPathId,
  onDragPreview,
}: {
  readonly dayNumberByPathId: ReadonlyMap<PlannerNodePathId, number>;
  // 수정: 원본은 드래그 상태를 지도 store로 보냈다. 데모는 바깥 지도에 콜백으로 알린다
  readonly onDragPreview?: (preview: DragPreview | null) => void;
}) {
  const tree = usePlannerViewStore((state) => state.tree);
  const rootPathId = usePlannerViewStore((state) => state.rootPathId);
  const expandedIds = usePlannerViewStore((state) => state.expandedIds);
  const expandNode = usePlannerViewStore((state) => state.expandNode);
  const moveNode = usePlannerViewStore((state) => state.moveNode);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    }, []),
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
  // - 그 밖(받아 주지 않는 자리, 컨테이너 안으로 넣는 중): 아무것도 옮기지 않고, 원래 자리의 빈 자리 표시도 숨김
  //   수정: 원본은 목록 밖에서만 숨겼다. 놓을 자리가 없을 때 원래 자리에 남은 표시가 "여기에 놓임"으로 읽혀서 같이 숨긴다
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
  // 리스트가 놓을 자리를 보여 줄 때만 지도에 알린다. 빈·접힌 폴더 대기 중에는 아직 받지 않는 이동이라 알리지 않는다
  const previewDestination = dragLayout && !isOutsideList ? dropDestination : null;
  const dropParentPathId = previewDestination?.parentPathId;
  const dropSiblingIndex = previewDestination?.siblingIndex;
  useEffect(() => {
    onDragPreview?.(
      activePathId
        ? {
            activePathId,
            destination:
              dropParentPathId === undefined || dropSiblingIndex === undefined
                ? null
                : { parentPathId: dropParentPathId, siblingIndex: dropSiblingIndex },
          }
        : null,
    );
  }, [activePathId, dropParentPathId, dropSiblingIndex, onDragPreview]);
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

  return (
    <div ref={scrollContainerRef} className="pb-5">
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
              return (
                <PlannerTreeItem
                  key={node.pathId}
                  node={node}
                  dragOffset={dragOffsets?.get(node.pathId) ?? 0}
                  dayNumber={dayNumberByPathId.get(node.pathId)}
                  isDropTargetVisible={dragLayout !== null}
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
  );
}

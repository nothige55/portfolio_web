"use client";

// trego-frontend aa76544 src/features/dnd/components/SortableContainer2.jsx 이식 (V4)
// 놓을 수 있는 자리에서만 형제가 벌어지고(isSnapped 'sibling'), 빈 컨테이너 위에서는 채움(isSnapped 'child')이 뜬다.
// 지도 이동·선택 해제는 데모에서 뺐고, "수정:" 주석이 붙은 곳만 원본과 다르다.

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { type ReactNode, useEffect, useRef, useState } from "react";

import type { LegacyItem, LegacyReorder } from "@/features/dnd/data/legacy-items";
import { PlanLabel } from "@/features/dnd/stage-b/components/plan-label";
import {
  isValidChildDrop,
  isValidSiblingDrop,
  prevIsLastSibling,
} from "@/features/dnd/stage-b/utils/dnd-condition";

export type Snap = "sibling" | "child" | false;

type Rect = { top: number; left: number; width: number; height: number };

export function SortableContainer({
  items,
  children,
  onReorder,
  setIsSnapped,
  childrenMap,
  expandedIds,
  toggleExpanded,
  dayNumberByPathId,
}: {
  items: readonly LegacyItem[];
  children: ReactNode;
  onReorder: (reorder: LegacyReorder) => void;
  setIsSnapped: (snap: Snap) => void;
  // 원본은 아래 셋을 planStore에서 읽었다
  childrenMap: ReadonlyMap<string, readonly LegacyItem[]>;
  expandedIds: ReadonlySet<string>;
  toggleExpanded: (pathId: string) => void;
  dayNumberByPathId: ReadonlyMap<string, number>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 10px 이상 움직여야 드래그 시작
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReadyToDropAsChild, setIsReadyToDropAsChild] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const toggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTopRef = useRef<number | null>(null);

  const overITemRef = useRef<LegacyItem | undefined>(undefined);

  const [isActiveToggled, setIsActiveToggled] = useState(false);

  const clearToggleTimer = () => {
    if (toggleTimerRef.current) {
      clearTimeout(toggleTimerRef.current);
      toggleTimerRef.current = null;
    }
  };

  // 수정: 원본은 드래그 도중 언마운트되면 타이머가 남았다
  useEffect(() => clearToggleTimer, []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    setIsDragging(true);
    if (expandedIds.has(id) && (childrenMap.get(id)?.length ?? 0) > 0) {
      setIsActiveToggled(true);
      toggleExpanded(id);
    }
  };

  const getIsOnOver = (event: DragMoveEvent | DragEndEvent) => {
    const overTop = event.over!.rect.top;
    const activeTop = event.active.rect.current.translated?.top;
    if (activeTop === undefined) return false;
    return (
      (overTop - activeTop > -7.5 && event.delta.y > 0) ||
      (overTop - activeTop < 7.5 && event.delta.y < 0)
    );
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;
    // 수정: 원본은 over가 없을 때(목록 밖) over.rect를 읽어 멈췄다
    if (!over) {
      clearToggleTimer();
      overITemRef.current = undefined;
      setIsReadyToDropAsChild(false);
      setIsSnapped(false);
      return;
    }
    const overItem = items.find((item) => item.pathId === over.id);
    const activeItem = items.find((item) => item.pathId === active.id);

    const oldIndex = items.findIndex((item) => item.pathId === active.id);
    const newIndex = items.findIndex((item) => item.pathId === over.id);
    const newItems = arrayMove([...items], oldIndex, newIndex);

    const prevItem = newItems[newIndex - 1];
    const nextItem = newItems[newIndex + 1];

    const isOnOver = getIsOnOver(event);

    if (overITemRef.current?.pathId !== overItem?.pathId) {
      clearToggleTimer();
      // 수정: 원본은 빈 컨테이너를 떠나도 준비 완료 상태가 남아, 다른 빈 컨테이너에 닿자마자 자식으로 들어갔다
      setIsReadyToDropAsChild(false);
    }
    overITemRef.current = overItem;

    if (isValidChildDrop({ expandedIds, childrenMap, overItem, activeItem }) && isOnOver && overItem) {
      if (!toggleTimerRef.current && (childrenMap.get(overItem.pathId)?.length ?? 0) > 0) {
        toggleTimerRef.current = setTimeout(() => {
          toggleExpanded(String(over.id));
          toggleTimerRef.current = null;
          activeTopRef.current = active.rect.current.translated?.top ?? null;
        }, 1000);
      }
      if (!childrenMap.get(overItem.pathId)) {
        setIsSnapped("child");
        // 수정: 원본은 이동 이벤트마다 타이머를 새로 걸고 앞의 것을 지우지 않았다
        if (!toggleTimerRef.current) {
          toggleTimerRef.current = setTimeout(() => {
            setIsReadyToDropAsChild(true);
            toggleTimerRef.current = null;
          }, 800); // 애니메이션은 1초, 딜레이는 0.8초
        }
      }
    } else if (isValidSiblingDrop({ activeItem, prevItem, nextItem })) {
      if (activeTopRef.current) {
        // activeTopRef가 설정된 상태라면 (즉, 자식 드롭으로 확장된 상태였다면)
        const gap = (active.rect.current.translated?.top ?? 0) - activeTopRef.current;
        if (Math.abs(gap) > 7.5) {
          activeTopRef.current = null;
        } else {
          return; // gap이 10px 이하인 경우에는 드래그 무시
        }
      }
      clearToggleTimer(); // 타이머 참조 초기화
      setIsReadyToDropAsChild(false);
      setIsSnapped("sibling");
    } else {
      setIsSnapped(false);
    }
  };

  const resetDrag = (activePathId: string | null) => {
    clearToggleTimer();
    overITemRef.current = undefined;
    activeTopRef.current = null;
    setIsSnapped(false);
    setIsReadyToDropAsChild(false);
    setIsDragging(false);
    setActiveId(null);
    if (isActiveToggled && activePathId) {
      toggleExpanded(activePathId);
      setIsActiveToggled(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const wasStabilizing = activeTopRef.current;
    resetDrag(String(active.id));
    // 수정: 원본은 over가 없을 때도 계속 진행해 overItem.parentPathId에서 멈췄다
    if (!over || active.id === over.id) return; // 위치 변화가 없으면 아무 것도 하지 않음 나중에 오른쪽으로 이동해서 active의 이전 아이템의 자식으로 들어가는것도 고려해야하나

    const oldIndex = items.findIndex((item) => item.pathId === active.id);
    const newIndex = items.findIndex((item) => item.pathId === over.id);
    const newItems = arrayMove([...items], oldIndex, newIndex);

    const overItem = items.find((item) => item.pathId === over.id);
    const activeItem = items.find((item) => item.pathId === active.id);
    if (!overItem || !activeItem) return;

    const prevItem = newItems[newIndex - 1];
    const nextItem = newItems[newIndex + 1];

    const isOnOver = getIsOnOver(event);

    const pathId = String(active.id);

    if (isValidChildDrop({ expandedIds, childrenMap, overItem, activeItem }) && isOnOver) {
      if (!childrenMap.get(overItem.pathId) && isReadyToDropAsChild) {
        onReorder({
          pathId,
          parentPathId: overItem.pathId,
          newPosition: 0.1,
        });
      }
      return;
    }

    if (!isValidSiblingDrop({ activeItem, prevItem, nextItem }) || !prevItem) return;

    if (wasStabilizing) {
      // activeTopRef가 설정된 상태라면 (즉, 자식 드롭으로 확장된 상태였다면)
      const gap = (active.rect.current.translated?.top ?? 0) - wasStabilizing;
      // 7.5px 이상 움직였을 때만 activeTopRef 초기화 (드래그 무시 상태에서 벗어남)
      if (Math.abs(gap) <= 7.5) {
        return; // gap이 10px 이하인 경우에는 드래그 무시
      }
    }

    // 수정: 원본은 아래 분기들이 if 나열이라 한 번 놓을 때 onReorder가 두 번 불리거나,
    // nextItem이 없을 때 nextItem.hierarchy를 읽어 멈췄다. 첫 번째로 맞는 분기만 타도록 묶었다
    const nextSiblingPosition = (item: LegacyItem) => {
      const siblings = childrenMap.get(item.parentPathId ?? "") ?? [];
      const index = siblings.findIndex((sibling) => sibling.pathId === item.pathId);
      // 수정: 원본은 nextItem이 첫 형제일 때 siblings[-1].position을 읽어 멈췄다
      return ((siblings[index - 1]?.position ?? 0) + item.position) / 2;
    };

    // prevItem이 root인 경우
    if (prevItem.position === 0 && nextItem) {
      onReorder({
        pathId,
        parentPathId: nextItem.parentPathId!,
        newPosition: nextItem.position / 2,
      });
    } else if (!nextItem) {
      // nextItem이 없는 경우
      onReorder({
        pathId,
        parentPathId: prevItem.parentPathId!,
        newPosition: prevItem.position + 0.1,
      });
    } else if (prevItem.hierarchy === nextItem.hierarchy) {
      onReorder({
        pathId,
        parentPathId: overItem.parentPathId!,
        newPosition: (prevItem.position + nextItem.position) / 2,
      });
    } else if (prevItem.hierarchy < nextItem.hierarchy) {
      // prev가 nextItem의 부모인 경우
      onReorder({
        pathId,
        parentPathId: nextItem.parentPathId!,
        newPosition: nextItem.position / 2,
      });
    } else {
      // prev가 prev 형제 중 마지막인 경우
      const dropDirection = prevIsLastSibling({ prevItem, activeItem, nextItem });
      if (dropDirection === "prev") {
        onReorder({
          pathId,
          parentPathId: prevItem.parentPathId!,
          newPosition: prevItem.position + 0.1,
        });
      }
      if (dropDirection === "next") {
        onReorder({
          pathId,
          parentPathId: nextItem.parentPathId!,
          newPosition: nextSiblingPosition(nextItem),
        });
      }
      if (dropDirection === "both") {
        // 양쪽 다 가능한 경우 커서의 위치가 중앙에 가까운 쪽으로 드롭
        const getCenter = (rect: Rect, item: LegacyItem) => {
          // hierarchy에 따른 left padding을 보정하여 실제 아이템의 중심점을 계산
          const leftPadding = 20 + (item.hierarchy - 1) * 30;
          const effectiveWidth = rect.width - leftPadding;
          return {
            x: rect.left + leftPadding + effectiveWidth / 2,
            y: rect.top + rect.height / 2,
          };
        };

        const activeRect = active.rect.current.translated;
        const prevItemRect = event.collisions?.find((c) => c.id === prevItem.pathId)?.data
          ?.droppableContainer.rect.current as Rect | undefined;
        const nextItemRect = event.collisions?.find((c) => c.id === nextItem.pathId)?.data
          ?.droppableContainer.rect.current as Rect | undefined;

        if (!activeRect || !prevItemRect || !nextItemRect) return;

        const activeCenter = getCenter(activeRect, activeItem);
        const prevCenter = getCenter(prevItemRect, prevItem);
        const nextCenter = getCenter(nextItemRect, nextItem);

        const distToPrev =
          (activeCenter.x - prevCenter.x) ** 2 + (activeCenter.y - prevCenter.y) ** 2;
        const distToNext =
          (activeCenter.x - nextCenter.x) ** 2 + (activeCenter.y - nextCenter.y) ** 2;

        if (distToPrev < distToNext) {
          onReorder({
            pathId,
            parentPathId: prevItem.parentPathId!,
            newPosition: prevItem.position + 0.1,
          });
        } else {
          onReorder({
            pathId,
            parentPathId: nextItem.parentPathId!,
            newPosition: nextSiblingPosition(nextItem),
          });
        }
      }
    }
  };

  const entity = items.find((item) => item.pathId === activeId);

  const leftPadding = entity ? 30 * (entity.hierarchy - 1) : 0;

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={(event) => resetDrag(String(event.active.id))}
      autoScroll={false}
      onDragMove={handleDragMove}
      // 수정: onDragMove의 over는 한 이벤트 늦게 바뀌어, 멈춘 자리의 자석 상태가 직전 행 기준으로 남았다.
      // over가 바뀌는 순간 불리는 onDragOver도 같은 핸들러로 받는다(V5~V6에서 같은 방식으로 고침)
      onDragOver={handleDragMove}
      collisionDetection={closestCenter}
    >
      {children}
      {isDragging && entity && (
        <DragOverlay>
          <div
            className="rounded-lg bg-[#E5F4FF]"
            style={{ marginLeft: 20, paddingLeft: leftPadding }}
          >
            <PlanLabel entity={entity} dayNumber={dayNumberByPathId.get(entity.pathId)} />
          </div>
        </DragOverlay>
      )}
    </DndContext>
  );
}

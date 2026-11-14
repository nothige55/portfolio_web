"use client";

// trego-frontend 8970c3a src/features/dnd/components/SortableContainer.jsx 이식 (V1~V3)
// 마우스 세로 위치로 위·가운데·아래·첫 자식 구역을, 가로 위치로 깊이를 고르고 선과 박스로 놓일 곳을 가리킨다.
// "수정:" 주석이 붙은 곳만 원본과 다르다.

import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

import { type LegacyItem, type LegacyReorder, sortedChildren } from "@/features/dnd/data/legacy-items";
import { PlanLabel } from "@/features/dnd/stage-a/components/plan-label";
import calcNewPosition from "@/features/dnd/stage-a/utils/calc-new-position";
import determineNewParentPathId from "@/features/dnd/stage-a/utils/determine-new-parent-path-id";
import dndCondition from "@/features/dnd/stage-a/utils/dnd-condition";
import type { DropZone } from "@/features/dnd/stage-a/utils/drop-zone";

const INDENT_PER_LEVEL = 32; // 계층 1단계당 32px
const BASE_INDENT = 22; // 루트 기준 패딩 + expand 아이콘 너비
const ROW_HEIGHT = 30;

type OverRect = { top: number; left: number; width: number; height: number };

function getFinalDropPosition(rect: OverRect, mouseY: number): DropZone | null {
  const mouseYDelta = mouseY - rect.top;

  if (mouseYDelta < 0 || mouseYDelta === rect.height) {
    return null;
  }
  if (rect.height > 30 && mouseYDelta >= 20 && mouseYDelta < 30) {
    return "firstChild";
  }
  if (mouseYDelta >= 10 && mouseYDelta <= rect.height - 10) {
    return "middle";
  }
  if (mouseYDelta > rect.height - 10 && mouseYDelta < rect.height) {
    return "bottom";
  }
  if (mouseYDelta < 10 || mouseYDelta > rect.height) {
    return "top";
  } // dnd-kit 충돌감지 알고리즘때문에 -1,0,30이 튀어나옴
  return null;
}

export function SortableContainer({
  items,
  onReorder,
  children,
}: {
  items: readonly LegacyItem[];
  onReorder: (reorder: LegacyReorder) => void;
  children: ReactNode;
}) {
  const [dropIndicatorStyle, setDropIndicatorStyle] = useState<CSSProperties | null>(null);
  const [activeItem, setActiveItem] = useState<LegacyItem | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLastSibling, setIsLastSibling] = useState(false);

  const [position, setPosition] = useState<DropZone | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 드래그 시작하기 위한 최소 거리
      },
    }),
  );

  const currentMouseY = useRef(0);
  const currentMouseX = useRef(0);

  // 수정: 원본은 렌더마다 새로 만든 handleMouseMove를 add/remove해서 remove가 다른 함수를 가리켰다.
  // 리스너가 드래그마다 쌓였다. 드래그 중에만 붙였다 떼는 effect로 옮겼다
  useEffect(() => {
    if (!activeItem) return;
    const handleMouseMove = (event: PointerEvent) => {
      currentMouseY.current = event.clientY;
      currentMouseX.current = event.clientX;
      setCursorPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };
    document.addEventListener("pointermove", handleMouseMove);
    return () => document.removeEventListener("pointermove", handleMouseMove);
  }, [activeItem]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active, activatorEvent } = event;
    const item = items.find((i) => i.pathId === active.id) ?? null;
    if (activatorEvent instanceof PointerEvent) {
      currentMouseX.current = activatorEvent.clientX;
      currentMouseY.current = activatorEvent.clientY;
      setCursorPosition({ x: activatorEvent.clientX, y: activatorEvent.clientY });
    }
    setPosition(null);
    setActiveItem(item);
  };

  // 수정: 원본은 document mousemove로만 좌표를 받아, dnd-kit의 dragMove보다 늦게 와서 한 이벤트 전 좌표로 판정했다.
  // 시작 좌표 + dnd-kit의 이동량으로 같은 이벤트의 좌표를 쓴다
  const syncPointer = (event: DragMoveEvent | DragEndEvent) => {
    if (event.activatorEvent instanceof PointerEvent) {
      currentMouseX.current = event.activatorEvent.clientX + event.delta.x;
      currentMouseY.current = event.activatorEvent.clientY + event.delta.y;
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    syncPointer(event);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setDropIndicatorStyle(null);
      return;
    }

    const overItem = items.find((item) => item.pathId === over.id);
    if (!overItem) return;

    const finalPosition = getFinalDropPosition(over.rect, currentMouseY.current);
    const mouseXDelta = currentMouseX.current - over.rect.left;
    const hierarchy = Math.floor((mouseXDelta - BASE_INDENT) / INDENT_PER_LEVEL) + 1;

    const indent =
      Math.max(0, Math.min(hierarchy - 1, overItem.hierarchy - 1)) * INDENT_PER_LEVEL + BASE_INDENT;

    const overIndent = (overItem.hierarchy - 1) * INDENT_PER_LEVEL + BASE_INDENT;

    setPosition(finalPosition);

    // 수정: 원본은 setIsLastSibling 직후 같은 핸들러에서 state를 읽어 한 박자 늦은 값으로 선을 그렸다
    const siblings = sortedChildren(items, overItem.parentPathId ?? "");
    const lastSibling = siblings[siblings.length - 1]?.pathId === overItem.pathId;
    setIsLastSibling(lastSibling);

    // 수정: 원본은 position: absolute에 원본 화면 레이아웃에 맞춘 상수(-16.5, -12)와 rect.left를 빼서
    // 좌표를 맞췄다. 다른 페이지에 넣으면 어긋나므로 dnd-kit rect(뷰포트 좌표) 그대로 fixed로 그린다
    const line = (top: number, left: number): CSSProperties => ({
      top,
      left: over.rect.left + left,
      width: over.rect.width - left,
      height: "1px",
      backgroundColor: "#000000",
    });

    let newStyle: CSSProperties | null = null;

    if (finalPosition === "top") {
      newStyle = line(over.rect.top, overIndent);
    } else if (finalPosition === "bottom" && lastSibling) {
      newStyle = line(over.rect.top + over.rect.height - 1, indent);
    } else if (finalPosition === "bottom" && !lastSibling) {
      newStyle = line(over.rect.top + over.rect.height - 1, overIndent);
    } else if (finalPosition === "firstChild") {
      newStyle = line(over.rect.top + ROW_HEIGHT, overIndent + INDENT_PER_LEVEL);
    } else if (finalPosition === "middle") {
      newStyle = {
        top: over.rect.top,
        left: over.rect.left + 4,
        width: over.rect.width - 4,
        height: ROW_HEIGHT,
        border: "1px solid #0D99FF",
        borderRadius: "8px 0px 0px 8px",
      };
    }
    setDropIndicatorStyle(
      newStyle && { ...newStyle, position: "fixed", zIndex: 10000, pointerEvents: "none" },
    );
  };

  const resetDrag = () => {
    setDropIndicatorStyle(null);
    setActiveItem(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    syncPointer(event);
    resetDrag();

    const { active, over } = event; // active: 드래그 중인 아이템, over: 드래그 중인 아이템 위에 있는 아이템

    if (!over || active.id === over.id || !activeItem) return;

    const overItem = items.find((item) => item.pathId === over.id); // 드래그 중인 아이템 위에 있는 아이템
    // 수정: 원본은 구역이 정해지지 않은 채(null) 놓아도 계속 진행해 position이 null로 저장됐다
    if (!overItem || !position) return;

    const condition = dndCondition({
      activeId: String(active.id),
      overId: String(over.id),
      items,
    });

    if (condition.isInvalidDrop) {
      return;
    }

    if (position === "middle") {
      if (condition.isInvalidChildDrop) {
        return;
      }
    }

    const mouseXDelta = currentMouseX.current - over.rect.left;

    const hierarchy = Math.floor((mouseXDelta - BASE_INDENT) / INDENT_PER_LEVEL) + 1;

    let ancestor: LegacyItem | undefined = overItem;
    while (ancestor && ancestor.hierarchy !== hierarchy) {
      const parentPathId: string | null = ancestor.parentPathId;
      ancestor = items.find((item) => item.pathId === parentPathId);
    }

    const newParentPathId = determineNewParentPathId({
      overItem,
      position,
      hierarchy,
      ancestor,
      isLastSibling,
    });
    if (!newParentPathId) return;

    const newPosition = calcNewPosition({
      items,
      overItem,
      position,
      newParentPathId,
      ancestor,
    });
    if (newPosition === null) return;

    onReorder({
      newPosition,
      parentPathId: newParentPathId,
      pathId: activeItem.pathId,
    });
  }; // 드래그가 끝날때 이동 대상의 새 position, parentPathId, pathId를 리턴

  return (
    <DndContext
      sensors={sensors} // 드래그 앤 드롭을 위한 센서
      onDragEnd={handleDragEnd} // 드래그가 끝났을 때 호출되는 함수
      onDragStart={handleDragStart} // 드래그가 시작될 때 호출되는 함수
      onDragMove={handleDragMove} // 드래그 중 마우스 이동 이벤트 핸들러
      // 수정: onDragMove의 over는 한 이벤트 늦게 바뀐다. 마지막 이동에서 행이 바뀌면 구역이 이전 행 기준으로 남아
      // 놓아도 움직이지 않았다. over가 바뀌는 순간 불리는 onDragOver도 같은 핸들러로 받는다(V5~V6에서 같은 방식으로 고침)
      onDragOver={handleDragMove}
      onDragCancel={resetDrag}
      // modifiers={[restrictToVerticalAxis]} // 드래그 앤 드롭 방향 수직으로 제한
      collisionDetection={pointerWithin} // 포인터가 아이템 위에 있을 때만 충돌 감지
    >
      {children}
      {dropIndicatorStyle && <div style={dropIndicatorStyle} />}
      {activeItem && (
        <div
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            position: "fixed",
            zIndex: 10001,
            pointerEvents: "none",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            width: "240px",
          }}
        >
          <PlanLabel entity={activeItem} />
        </div>
      )}
    </DndContext>
  );
}

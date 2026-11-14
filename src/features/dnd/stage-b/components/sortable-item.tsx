// trego-frontend aa76544 SortableItem.jsx 이식
// 형제 자리에 붙었을 때(sibling)만 정렬 transform을 걸어 형제가 벌어지고, 빈 컨테이너 위(child)에서는 채움을 그린다

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import type { Snap } from "@/features/dnd/stage-b/components/sortable-container";

export function SortableItem({
  id,
  children,
  isSnapped,
}: {
  id: string;
  children: ReactNode;
  isSnapped: Snap;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, overIndex, index } =
    useSortable({
      id,
    });

  const shouldApplyFill = isSnapped === "child" && index === overIndex;

  const activeAnimation = isSnapped === "sibling" ? transform : null;

  const style = {
    transform: CSS.Transform.toString(activeAnimation),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  // 원본 SortableItem.css의 .sortable-item / .snapped-child-fill (globals.css로 옮김)
  const classNames = ["relative z-[1]"];
  if (shouldApplyFill) {
    classNames.push("v4-snapped-child-fill");
  }

  return (
    <div
      ref={setNodeRef}
      className={classNames.join(" ")}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

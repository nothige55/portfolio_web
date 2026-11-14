// trego-frontend 8970c3a SortableItem.jsx 이식
// 원본 PlanBody는 SortableContext에 id 필드가 없는 엔터티 객체를 넘겨, dnd-kit이 정렬 index를 찾지 못했다.
// 그래서 transform은 늘 null이었고 행은 움직이지 않았다(선과 커서 라벨만 움직임). 그 동작을 그대로 둔다.

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

export function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // isOver, position, itemContext 등 모든 인디케이터 로직 제거!

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

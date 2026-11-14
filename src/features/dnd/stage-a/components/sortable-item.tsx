// trego-frontend 8970c3a SortableItem.jsx 이식
// 원본 PlanBody/PlanNode는 SortableContext에 엔터티 객체를 그대로 넘겼다(items={filteredArray}).
// dnd-kit은 객체면 item.id를 쓰는데, 엔터티는 folderId/dayId/activityId/pathId로 구분되고 코드 어디서도 .id를 읽지 않는다.
// 설령 id가 있어도 서버 엔터티 ID라 이 행의 id(pathId)와 달라, 정렬 index가 -1이 되어 transform이 null이었을 것이다.
// 그래서 행은 움직이지 않고 선과 커서 라벨만 움직였을 것이다. 원본을 돌려 본 게 아니라 소스를 읽고 낸 결론이다.
// 이 이식본은 SortableContext를 두지 않아(useSortable의 기본 context) 같은 결과이고, 그 동작을 그대로 둔다.

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

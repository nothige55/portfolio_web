// trego-frontend 8970c3a PlanLabel.jsx 이식. 이름 편집, 메모, Day 설정·표시 토글은 데모에서 뺐다

import { Folder, ListTodo } from "lucide-react";

import type { LegacyItem } from "@/features/dnd/data/legacy-items";

export function PlanLabel({
  entity,
  index,
  color,
  dayNumber,
}: {
  entity: LegacyItem;
  index?: number;
  color?: string | null;
  dayNumber?: number;
}) {
  if (entity.folderId) {
    return (
      <div className="flex h-[30px] w-full items-center gap-1 pl-1 text-sm">
        <Folder aria-hidden="true" className="size-4" strokeWidth={1.5} />
        {entity.name}
      </div>
    );
  }
  if (entity.dayId) {
    return (
      <div className="flex h-[30px] w-full items-center justify-between pr-[20px] pl-1 text-sm">
        <div className="flex items-center gap-1">
          <ListTodo aria-hidden="true" className="size-4" strokeWidth={1.5} />
          {entity.name}
        </div>
        {dayNumber !== undefined && (
          <p className="min-w-[40px] text-sm text-[#0D99FF] opacity-60">Day {dayNumber}</p>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-[30px] w-full items-center pl-1 text-sm">
      {/* SpotNumberBadge */}
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
        style={{ backgroundColor: color ?? "#9D9D9D" }}
      >
        {index}
      </span>
      <p className="pl-2 leading-none">{entity.name}</p>
    </div>
  );
}

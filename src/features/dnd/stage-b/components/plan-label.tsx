// trego-frontend aa76544 nodelabel/PlanLabel.jsx(Folder·Day·ActivityLabel) 이식. 편집·메모·설정 버튼은 데모에서 뺐다
// ca68b49 이후 Day 이름 대신 달력 아이콘에 날짜 번호를 넣었다

import { Folder, Heart } from "lucide-react";

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
      <div className="flex min-h-[30px] items-center gap-2 text-sm">
        {entity.folderType === "wish" ? (
          <Heart aria-hidden="true" className="size-4 fill-[#F44336] text-[#F44336]" />
        ) : (
          <Folder aria-hidden="true" className="size-4 fill-[#FFA000] text-[#FFA000]" />
        )}
        {entity.name}
      </div>
    );
  }
  if (entity.dayId) {
    return (
      <div className="flex min-h-[30px] items-center gap-2 text-sm">
        <span
          className="flex size-4 items-end justify-center rounded-[3px] border-t-4 bg-[#EDF5FF] text-[8px] leading-none font-bold"
          style={{ borderTopColor: entity.color ?? "#F44336" }}
        >
          {dayNumber}
        </span>
        {entity.name}
      </div>
    );
  }
  return (
    <div className="flex min-h-[30px] items-center gap-2 text-sm">
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
        style={{ backgroundColor: color ?? "#9D9D9D" }}
      >
        {index}
      </span>
      {entity.name}
    </div>
  );
}

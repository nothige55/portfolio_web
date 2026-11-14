// trego-frontend aa76544 PlanItem.jsx + ToggleButton.jsx + usePlanItemPL.js 이식
// 행이 자식을 품지 않는 평평한 목록이다(V1~V3의 중첩과 다름). 선택·hover 강조, 지도 이동, 경로 정보는 데모에서 뺐다

import { ChevronDown } from "lucide-react";

import type { LegacyItem } from "@/features/dnd/data/legacy-items";
import { PlanLabel } from "@/features/dnd/stage-b/components/plan-label";
import type { Snap } from "@/features/dnd/stage-b/components/sortable-container";
import { SortableItem } from "@/features/dnd/stage-b/components/sortable-item";

function ToggleButton({
  entity,
  hasChildren,
  isExpanded,
  toggleExpanded,
}: {
  entity: LegacyItem;
  hasChildren: boolean;
  isExpanded: boolean;
  toggleExpanded: (pathId: string) => void;
}) {
  if (!hasChildren) return null;
  return (
    <button
      type="button"
      aria-label={`${entity.name} ${isExpanded ? "접기" : "펼치기"}`}
      onClick={(event) => {
        event.stopPropagation();
        toggleExpanded(entity.pathId);
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <ChevronDown
        aria-hidden="true"
        className="size-4 text-[#9D9D9D]"
        style={isExpanded ? undefined : { rotate: "270deg" }}
      />
    </button>
  );
}

export function PlanItem({
  entity,
  isSnapped,
  hasChildren,
  isExpanded,
  toggleExpanded,
  index,
  color,
  dayNumber,
}: {
  entity: LegacyItem;
  isSnapped: Snap;
  hasChildren: boolean;
  isExpanded: boolean;
  toggleExpanded: (pathId: string) => void;
  index?: number;
  color?: string | null;
  dayNumber?: number;
}) {
  // usePlanItemPL
  const paddingLeft =
    entity.hierarchy > 1 && hasChildren ? 30 * (entity.hierarchy - 1) - 16 : 30 * (entity.hierarchy - 1);
  const toggle = (
    <ToggleButton
      entity={entity}
      hasChildren={hasChildren}
      isExpanded={isExpanded}
      toggleExpanded={toggleExpanded}
    />
  );

  return (
    <SortableItem id={entity.pathId} isSnapped={isSnapped}>
      <div className="flex justify-end">
        <div className="flex w-5 items-center justify-end">{entity.hierarchy === 1 && toggle}</div>
        <div
          className="flex w-[calc(100%-20px)] rounded-l-lg hover:bg-[#F5F5F5]"
          style={{ paddingRight: "8px", paddingLeft }}
        >
          {/* togglebutton h:16 + 7*2 = 30px */}
          <div className="mt-[7px] flex h-fit">{entity.hierarchy > 1 && toggle}</div>
          <PlanLabel entity={entity} index={index} color={color} dayNumber={dayNumber} />
        </div>
      </div>
    </SortableItem>
  );
}

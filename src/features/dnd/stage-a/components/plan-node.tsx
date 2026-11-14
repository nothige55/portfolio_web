// trego-frontend 8970c3a PlanNode.jsx + CustomTreeItem.jsx 이식
// 행이 자식을 품는 중첩 구조라서, 자식이 있는 행의 충돌 rect는 자식까지 포함해 30px보다 크다.
// SortableContainer의 firstChild 구역(rect 높이 > 30)이 이 구조에 기대고 있다.
// 선택·hover 강조, 다중 선택, 지도 이동, 컨텍스트 메뉴, 경로 정보는 데모에서 뺐다.

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { type LegacyItem, sortedChildren } from "@/features/dnd/data/legacy-items";
import { PlanLabel } from "@/features/dnd/stage-a/components/plan-label";
import { SortableItem } from "@/features/dnd/stage-a/components/sortable-item";

export function PlanNode({
  items,
  item,
  index,
  hierarchy,
  color,
  dayNumberByPathId,
}: {
  items: readonly LegacyItem[];
  item: LegacyItem;
  index: number;
  hierarchy: number;
  color?: string | null;
  dayNumberByPathId: ReadonlyMap<string, number>;
}) {
  const [expanded, setExpanded] = useState(true);
  const filteredArray = item.activityId ? [] : sortedChildren(items, item.pathId);
  const hasChildren = filteredArray.length > 0;

  const pl = hasChildren ? 32 * (hierarchy - 1) + 6 : 32 * (hierarchy - 1) + 22; // 32px * (계층 - 1) + 8px + 14px (아이콘 너비)

  let idx = 0;

  return (
    <SortableItem id={item.pathId}>
      <div className="ml-[4px] flex w-[calc(100%-4px)] rounded-l-lg hover:bg-[#F5F5F5]">
        {/* 확장/축소 버튼, 자식 없을때도 라벨이 동일한 x값 갖게 하기 위해 패딩만 가진 div 리턴 */}
        {hasChildren ? (
          <button
            type="button"
            aria-label={`${item.name} ${expanded ? "접기" : "펼치기"}`}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            style={{ paddingLeft: pl }}
          >
            <ChevronDown
              aria-hidden="true"
              className="size-4"
              style={expanded ? undefined : { rotate: "270deg" }}
            />
          </button>
        ) : (
          <div className="w-[14px]" style={{ paddingLeft: pl }} />
        )}
        <PlanLabel entity={item} index={index} color={color} dayNumber={dayNumberByPathId.get(item.pathId)} />
      </div>
      {expanded &&
        filteredArray.map((element) => {
          if (element.activityId) idx += 1;
          return (
            <PlanNode
              key={element.pathId}
              items={items}
              item={element}
              index={idx}
              hierarchy={hierarchy + 1}
              color={item.color ?? color}
              dayNumberByPathId={dayNumberByPathId}
            />
          );
        })}
    </SortableItem>
  );
}

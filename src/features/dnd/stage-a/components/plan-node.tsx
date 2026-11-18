// trego-frontend 8970c3a PlanNode.jsx + CustomTreeItem.jsx 이식
// 행이 자식을 품는 중첩 구조라서, 자식이 있는 행의 충돌 rect는 자식까지 포함해 30px보다 크다.
// SortableContainer의 firstChild 구역(rect 높이 > 30)이 이 구조에 기대고 있다.
// 선택·hover 강조, 다중 선택, 지도 이동, 컨텍스트 메뉴, 경로 정보는 데모에서 뺐다.
// 수정: 원본은 32px 들여쓰기에 왼쪽 4px 여백, 아이콘 위치를 패딩으로 맞췄다.
// V4, V5~V6와 같은 모양이 되도록 30px 들여쓰기 + 20px 펼침 칸(shared/row-metrics)으로 바꿨다

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { type LegacyItem, sortedChildren } from "@/features/dnd/data/legacy-items";
import { PlanLabel } from "@/features/dnd/stage-a/components/plan-label";
import { SortableItem } from "@/features/dnd/stage-a/components/sortable-item";
import { DND_INDENT_WIDTH } from "@/features/dnd/shared/row-metrics";

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

  let idx = 0;

  return (
    <SortableItem id={item.pathId}>
      <div
        className="flex w-full rounded-l-lg hover:bg-[#F5F5F5]"
        style={{ paddingLeft: DND_INDENT_WIDTH * (hierarchy - 1) }}
      >
        {/* 확장/축소 버튼. 자식이 없어도 칸을 비워 둬 라벨이 같은 x값을 갖게 한다 */}
        <span className="flex h-[30px] w-5 shrink-0 items-center justify-end">
          {hasChildren && (
            <button
              type="button"
              aria-label={`${item.name} ${expanded ? "접기" : "펼치기"}`}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ChevronDown
                aria-hidden="true"
                className="size-4"
                style={expanded ? undefined : { rotate: "270deg" }}
              />
            </button>
          )}
        </span>
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

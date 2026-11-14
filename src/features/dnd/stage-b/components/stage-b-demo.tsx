"use client";

import { useMemo, useState } from "react";

import { DemoFrame } from "@/features/dnd/components/demo-frame";
import { jejuSeed } from "@/features/dnd/data/jeju-seed";
import {
  applyLegacyReorder,
  buildDayNumbers,
  type LegacyItem,
  sortedChildren,
  toLegacyItems,
  withHierarchy,
} from "@/features/dnd/data/legacy-items";
import { PlanItem } from "@/features/dnd/stage-b/components/plan-item";
import { type Snap, SortableContainer } from "@/features/dnd/stage-b/components/sortable-container";
import { SortableContext } from "@dnd-kit/sortable";

const initialItems = () => withHierarchy(toLegacyItems(jejuSeed));
// 원본 setServerData: 처음 받은 모든 노드의 pathId를 펼침 상태로 둔다(빈 Day 포함)
const initialExpanded = () => new Set(initialItems().map((item) => item.pathId));

// 원본 planStore의 childrenMap: 자식이 있는 부모만 키로 둔다(빈 컨테이너는 get이 undefined)
function buildChildrenMap(items: readonly LegacyItem[]) {
  const map = new Map<string, LegacyItem[]>();
  for (const item of items) {
    if (item.parentPathId === null) continue;
    map.set(item.parentPathId, sortedChildren(items, item.parentPathId));
  }
  return map;
}

// 원본 planStore의 flattenedItems + PlanList의 visibleItems: 깊이 우선으로 펴고 접힌 가지는 뺀다
function buildVisibleItems(
  items: readonly LegacyItem[],
  childrenMap: ReadonlyMap<string, readonly LegacyItem[]>,
  expandedIds: ReadonlySet<string>,
) {
  const result: LegacyItem[] = [];
  const visit = (item: LegacyItem) => {
    result.push(item);
    if (item.parentPathId !== null && !expandedIds.has(item.pathId)) return;
    for (const child of childrenMap.get(item.pathId) ?? []) visit(child);
  };
  const root = items.find((item) => item.position === 0);
  if (root) visit(root);
  return result;
}

export function StageBDemo() {
  const [items, setItems] = useState(initialItems);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(initialExpanded);
  const [isSnapped, setIsSnapped] = useState<Snap>(false);
  const childrenMap = useMemo(() => buildChildrenMap(items), [items]);
  const visibleItems = useMemo(
    () => buildVisibleItems(items, childrenMap, expandedIds),
    [items, childrenMap, expandedIds],
  );
  const dayNumberByPathId = useMemo(() => buildDayNumbers(items), [items]);
  const toggleExpanded = (pathId: string) =>
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(pathId)) next.delete(pathId);
      else next.add(pathId);
      return next;
    });

  return (
    <DemoFrame
      onReset={() => {
        setItems(initialItems());
        setExpandedIds(initialExpanded());
      }}
    >
      <SortableContainer
        items={visibleItems}
        onReorder={(reorder) => setItems((current) => applyLegacyReorder(current, reorder))}
        setIsSnapped={setIsSnapped}
        childrenMap={childrenMap}
        expandedIds={expandedIds}
        toggleExpanded={toggleExpanded}
        dayNumberByPathId={dayNumberByPathId}
      >
        <SortableContext items={visibleItems.map((item) => item.pathId).slice(1)}>
          {visibleItems.slice(1).map((item) => {
            const parent = items.find((candidate) => candidate.pathId === item.parentPathId);
            const siblings = childrenMap.get(item.parentPathId ?? "") ?? [];
            return (
              <PlanItem
                key={item.pathId}
                entity={item}
                isSnapped={isSnapped}
                hasChildren={(childrenMap.get(item.pathId)?.length ?? 0) > 0}
                isExpanded={expandedIds.has(item.pathId)}
                toggleExpanded={toggleExpanded}
                index={siblings.findIndex((sibling) => sibling.pathId === item.pathId) + 1}
                color={parent?.color}
                dayNumber={dayNumberByPathId.get(item.pathId)}
              />
            );
          })}
        </SortableContext>
      </SortableContainer>
    </DemoFrame>
  );
}

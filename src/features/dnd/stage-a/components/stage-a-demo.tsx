"use client";

import { useMemo, useState } from "react";

import { DemoFrame } from "@/features/dnd/components/demo-frame";
import { jejuSeed } from "@/features/dnd/data/jeju-seed";
import {
  applyLegacyReorder,
  buildDayNumbers,
  sortedChildren,
  toLegacyItems,
  withHierarchy,
} from "@/features/dnd/data/legacy-items";
import { PlanNode } from "@/features/dnd/stage-a/components/plan-node";
import { SortableContainer } from "@/features/dnd/stage-a/components/sortable-container";

const initialItems = () => withHierarchy(toLegacyItems(jejuSeed));

export function StageADemo() {
  const [items, setItems] = useState(initialItems);
  // 처음으로를 누르면 행마다 가진 펼침 상태까지 새로 시작하도록 key를 바꾼다
  const [version, setVersion] = useState(0);
  const dayNumberByPathId = useMemo(() => buildDayNumbers(items), [items]);
  // 원본 PlanBody: position이 0인 엔터티가 root
  const root = items.find((item) => item.position === 0);

  return (
    <DemoFrame
      onReset={() => {
        setItems(initialItems());
        setVersion((value) => value + 1);
      }}
    >
      <SortableContainer
        key={version}
        items={items}
        onReorder={(reorder) => setItems((current) => applyLegacyReorder(current, reorder))}
      >
        {root &&
          sortedChildren(items, root.pathId).map((element) => (
            <PlanNode
              key={element.pathId}
              items={items}
              item={element}
              index={0}
              hierarchy={1}
              dayNumberByPathId={dayNumberByPathId}
            />
          ))}
      </SortableContainer>
    </DemoFrame>
  );
}

"use client";

// Trego breadcrumb 로직 이식: 스크롤 기준 행 판정, 조상 경로, 구간 끝 경계 라벨.
// 트리 빌더는 dnd/stage-c 것을 쓰고, 시드는 breadcrumb 체험용으로 따로 둠.
// 행·breadcrumb·경계 라벨은 원본처럼 PlannerNodeLabel(Day 달력·폴더·장소 핀 아이콘)을 같이 쓴다

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";

import { breadcrumbSeed, BREADCRUMB_ROOT_ID as ROOT_PATH_ID } from "@/features/dnd/breadcrumb/data/breadcrumb-seed";
import { useBreadcrumbScroll } from "@/features/dnd/breadcrumb/hooks/use-breadcrumb-scroll";
import { getBoundaryAncestor } from "@/features/dnd/breadcrumb/utils/get-boundary-ancestor";
import { getBreadcrumbAncestors } from "@/features/dnd/breadcrumb/utils/get-breadcrumb-ancestors";
import { DND_ROW_HEIGHT } from "@/features/dnd/shared/row-metrics";
import { PlannerNodeLabel } from "@/features/dnd/stage-c/components/planner-node-label";
import type { FlattenedPlannerNode } from "@/features/dnd/stage-c/types/planner-node";
import { buildPlannerTree } from "@/features/dnd/stage-c/utils/build-planner-tree";
import { getPlannerRowIndentation } from "@/features/dnd/stage-c/utils/get-planner-row-indentation";

// 트리 행, breadcrumb, 경계 라벨이 같은 라벨과 시작 위치를 씀 (원본도 PlannerNodeLabel 하나를 같이 씀)
// 시작 위치는 펼침 버튼 칸(18px)만큼 띄운 1단계 라벨의 x
const LABEL_START = 18;

// breadcrumb과 행이 같은 높이. 스크롤 판정(use-breadcrumb-scroll)도 같은 값을 써서 style로 지정함
const ROW_STYLE = { height: DND_ROW_HEIGHT };

const tree = buildPlannerTree(breadcrumbSeed);
// 원본 패널처럼 루트는 행으로 그리지 않음 (tree.entityMap에는 남음)
const items = tree.flattenedItems.filter((node) => node.pathId !== ROOT_PATH_ID);
// stage-c처럼 화면 순서대로 Day 번호를 매긴다
const dayNumbers = new Map(
  items.filter((node) => node.kind === "day").map((node, i) => [node.pathId, i + 1] as const),
);

function Label({ node }: { node: FlattenedPlannerNode }) {
  return (
    <PlannerNodeLabel
      node={node}
      dayNumber={dayNumbers.get(node.pathId)}
      parent={node.parentPathId ? tree.entityMap.get(node.parentPathId) : undefined}
      className="min-w-0 shrink"
    />
  );
}

export function BreadcrumbDemo() {
  const itemElements = useRef(new Map<string, HTMLElement>());
  const getItemElement = useCallback((id: string) => itemElements.current.get(id) ?? null, []);
  const { scrollContainerRef, topItemId, updateTopItem } = useBreadcrumbScroll({
    items,
    getItemElement,
  });
  const ancestors = useMemo(
    () => getBreadcrumbAncestors(topItemId, ROOT_PATH_ID, tree.entityMap),
    [topItemId],
  );

  return (
    // 원본 일정 패널 폭(320px, DemoFrame과 같음)에 세로로 길게 둔다. 트리(약 27행)가 패널보다 길어야 스크롤이 생긴다
    <div className="mx-auto flex h-[min(560px,64vh)] w-full max-w-80 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-black/5 shadow-[0_40px_100px_-40px_color-mix(in_srgb,var(--project)_55%,transparent)]">
      <div className="shrink-0 border-b px-4 py-3">
        <p className="text-sm font-semibold">제주 여행</p>
        <p className="text-xs text-muted-foreground">08.12 – 08.17</p>
      </div>
      <div className="relative min-h-0 w-full flex-1 overflow-hidden text-sm">
        <div ref={scrollContainerRef} className="thin-scrollbar h-full overflow-y-auto pb-5" onScroll={updateTopItem}>
          {/* 자리를 차지하지 않고(marginBottom 음수) 행 위에 겹쳐 뜸. 그래서 비어 있을 때 빈 띠를 둘 필요가 없고 목록도 안 흔들림 */}
          {ancestors.length > 0 ? (
            <nav
              aria-label="현재 일정 경로"
              className="pointer-events-none sticky z-40 flex items-center gap-1 overflow-hidden bg-card pr-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']"
              style={{ ...ROW_STYLE, top: 0, marginBottom: -DND_ROW_HEIGHT, paddingLeft: LABEL_START }}
            >
              {ancestors.map((a, i) => (
                <span key={a.pathId} className="flex min-w-0 shrink-0 items-center gap-1">
                  <Label node={a} />
                  {i < ancestors.length - 1 ? (
                    <span aria-hidden="true" className="text-sm leading-none text-muted-foreground">
                      /
                    </span>
                  ) : null}
                </span>
              ))}
            </nav>
          ) : null}
          <ul role="tree" aria-label="일정 트리">
            {items.map((node, index) => {
              const boundary = getBoundaryAncestor({
                node,
                nextNode: items[index + 1],
                tree,
                rootPathId: ROOT_PATH_ID,
                topItemId,
              });
              return (
                <li
                  key={node.pathId}
                  ref={(el) => {
                    if (el) itemElements.current.set(node.pathId, el);
                    else itemElements.current.delete(node.pathId);
                  }}
                  role="treeitem"
                  aria-selected={false}
                  className="relative flex items-center"
                  style={{ ...ROW_STYLE, paddingLeft: getPlannerRowIndentation(node.depth) + LABEL_START }}
                >
                  {boundary ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-30 flex items-center bg-card pr-4"
                      style={{ paddingLeft: LABEL_START }}
                    >
                      <Label node={boundary} />
                    </span>
                  ) : null}
                  {/* 원본 행처럼 자식이 있으면 펼침 표시를 둔다. 이 데모는 접지 않으므로 장식이다 */}
                  <span aria-hidden="true" className="absolute flex w-[18px] justify-end text-muted-foreground" style={{ left: getPlannerRowIndentation(node.depth) }}>
                    {node.kind !== "activity" ? <ChevronDown className="size-4" /> : null}
                  </span>
                  <Label node={node} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

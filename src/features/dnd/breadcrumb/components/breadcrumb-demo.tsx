"use client";

// Trego breadcrumb 로직 이식: 스크롤 기준 행 판정, 조상 경로, 구간 끝 경계 라벨.
// 트리 빌더는 dnd/stage-c 것을 쓰고, 시드는 breadcrumb 체험용으로 따로 둠.
// 행·breadcrumb·경계 라벨은 원본처럼 PlannerNodeLabel(Day 달력·폴더·장소 핀 아이콘)을 같이 쓴다

import { ChevronDown, Mouse, ZoomIn } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { DemoHint } from "@/components/ui/demo-hint";

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
// 확대 렌즈 배율
const LENS_SCALE = 1.5;
// 렌즈는 원본처럼 위아래 구분선이 없어 이웃 행 글자 끝이 비친다. 막대 글자 띠만 남기도록 위아래를 이만큼 잘라 낸다(렌즈 확대 전 px)
const LENS_CROP_TOP = 6;
const LENS_CROP_BOTTOM = 6;

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
  // 처음 스크롤하거나 누르면 안내를 걷는다.
  const lensRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);
  const ancestors = useMemo(
    () => getBreadcrumbAncestors(topItemId, ROOT_PATH_ID, tree.entityMap),
    [topItemId],
  );

  // 원본과 렌즈가 같은 JSX를 쓴다. 렌즈는 측정용 ref와 접근성 속성을 빼야 원본 판정이 안 깨진다
  const renderList = (mode: "main" | "lens"): ReactNode => {
    const main = mode === "main";
    return (
      <>
            {/* 자리를 차지하지 않고(marginBottom 음수) 행 위에 겹쳐 뜸. 그래서 비어 있을 때 빈 띠를 둘 필요가 없고 목록도 안 흔들림 */}
            {ancestors.length > 0 ? (
              <nav
                aria-label={main ? "현재 일정 경로" : undefined}
                // 렌즈는 막대 한 줄만 비추므로 아래 구분선이 테두리처럼 보여 뺀다
                className={`pointer-events-none sticky z-40 flex items-center gap-1 overflow-hidden bg-card pr-4 ${main ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']" : ""}`}
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
            <ul role={main ? "tree" : undefined} aria-label={main ? "일정 트리" : undefined}>
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
      </>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-80 flex-col gap-3">
      {/* 막대가 작아 안 보이므로 패널 맨 위 1행(브레드크럼 막대 자리)을 1.5배로 비추는 실시간 렌즈. 스크린리더는 원본을 읽는다 */}
      <div aria-hidden="true" className="relative rounded-xl bg-card py-3 shadow-sm ring-1 ring-black/5">
        <p className="flex items-center gap-1.5 px-4 font-mono text-xs text-muted-foreground">
          <ZoomIn className="size-3.5" />
          브레드크럼 확대
        </p>
        <div className="mt-2 w-full overflow-hidden" style={{ height: (DND_ROW_HEIGHT - LENS_CROP_TOP - LENS_CROP_BOTTOM) * LENS_SCALE }}>
          {/* 320은 패널 폭이라 원본과 줄바꿈·truncate가 같다. 왼쪽 정렬을 위해 원점은 좌상단 */}
          <div style={{ width: 320, marginTop: -LENS_CROP_TOP * LENS_SCALE, transform: `scale(${LENS_SCALE})`, transformOrigin: "0 0" }}>
            <div
              ref={lensRef}
              className="overflow-hidden bg-card pb-5 text-sm"
              style={{ height: DND_ROW_HEIGHT, scrollBehavior: "auto" }}
            >
              {renderList("lens")}
            </div>
          </div>
        </div>
        <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b border-black/5 bg-card" />
      </div>
      {/* 원본 일정 패널 폭(320px, DemoFrame과 같음)에 세로로 길게 둔다. 트리(약 27행)가 패널보다 길어야 스크롤이 생긴다 */}
      <div className="flex h-[min(500px,56vh)] flex-col overflow-hidden rounded-xl bg-card ring-1 ring-black/5 shadow-[0_40px_100px_-40px_color-mix(in_srgb,var(--project)_55%,transparent)]">
        <div className="shrink-0 border-b px-4 py-3">
          <p className="text-sm font-semibold">제주 여행</p>
          <p className="text-xs text-muted-foreground">08.12 – 08.17</p>
        </div>
        <div className="relative min-h-0 w-full flex-1 overflow-hidden text-sm">
          <div
            ref={scrollContainerRef}
            className="thin-scrollbar h-full overflow-y-auto pb-5"
            onScroll={(e) => {
              updateTopItem();
              // 렌즈는 원본 scrollTop을 그대로 따라간다(transform은 scrollTop 단위에 영향 없음)
              if (lensRef.current) lensRef.current.scrollTop = e.currentTarget.scrollTop;
              if (e.currentTarget.scrollTop > 0) setTouched(true);
            }}
            onPointerDownCapture={() => setTouched(true)}
            onKeyDownCapture={() => setTouched(true)}
          >
            {renderList("main")}
          </div>
          <DemoHint
            text="목록을 스크롤해 보세요"
            icon={<Mouse />}
            visible={!touched}
            className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  );
}

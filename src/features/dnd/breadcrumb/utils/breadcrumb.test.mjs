// 스크롤 기준 행의 조상 경로와 구간 끝 경계 라벨 규칙을 breadcrumb 체험용 시드로 확인한다.
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPlannerTree } from "../../stage-c/utils/build-planner-tree.ts";
import { breadcrumbSeed, BREADCRUMB_ROOT_ID } from "../data/breadcrumb-seed.ts";
import { getBoundaryAncestor } from "./get-boundary-ancestor.ts";
import { getBreadcrumbAncestors } from "./get-breadcrumb-ancestors.ts";

const tree = buildPlannerTree(breadcrumbSeed);
const items = tree.flattenedItems.filter((node) => node.pathId !== BREADCRUMB_ROOT_ID);
const byName = (name) => items.find((node) => node.name === name);
const names = (nodes) => nodes.map((node) => node.name);

test("장소의 조상 경로는 루트를 뺀 폴더 > 날짜다", () => {
  const path = getBreadcrumbAncestors(byName("용두암").pathId, BREADCRUMB_ROOT_ID, tree.entityMap);
  assert.deepEqual(names(path), ["제주시", "8월 13일"]);
});

test("최상위 노드는 조상이 없어 경로가 비다", () => {
  assert.deepEqual(getBreadcrumbAncestors(byName("제주시").pathId, BREADCRUMB_ROOT_ID, tree.entityMap), []);
});

test("다음 구간이 기준 행이 되면 바로 앞 행에 이전 폴더 라벨이 붙는다", () => {
  const next = byName("서귀포");
  const previous = items[items.indexOf(next) - 1];
  const boundary = getBoundaryAncestor({
    node: previous,
    nextNode: next,
    tree,
    rootPathId: BREADCRUMB_ROOT_ID,
    topItemId: next.pathId,
  });
  assert.equal(boundary?.name, "제주시");
});

test("기준 행이 다음 구간이 아니면 경계 라벨은 없다", () => {
  const next = byName("서귀포");
  const previous = items[items.indexOf(next) - 1];
  assert.equal(
    getBoundaryAncestor({ node: previous, nextNode: next, tree, rootPathId: BREADCRUMB_ROOT_ID, topItemId: previous.pathId }),
    undefined,
  );
});

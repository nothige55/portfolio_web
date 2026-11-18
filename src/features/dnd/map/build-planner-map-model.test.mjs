// 원본 테스트(trego-web-portfolio build-planner-map-model.test.ts, vitest)에서 데모에 닿는 규칙만 node:test로 옮겼다.
// 데모 시드(jeju-seed)를 그대로 넣어, 트리를 옮기면 지도 번호·경로가 따라 바뀌는지를 본다.
import assert from "node:assert/strict";
import { test } from "node:test";

import { jejuSeed } from "../data/jeju-seed.ts";
import { buildPlannerTree } from "../stage-c/utils/build-planner-tree.ts";
import { buildPlannerMapModel } from "./build-planner-map-model.ts";

const noHidden = new Set();

function modelOf(nodes, options = {}) {
  return buildPlannerMapModel({
    tree: buildPlannerTree(nodes),
    hiddenDayIds: noHidden,
    selectedItemId: null,
    ...options,
  });
}

test("Day마다 위치 순서대로 번호를 매기고 같은 색 경로선을 만든다", () => {
  const { markers, routes } = modelOf(jejuSeed);
  const d12 = markers.filter((marker) => marker.dayPathId === "d12");

  assert.deepEqual(
    d12.map(({ pathId, number, color }) => [pathId, number, color]),
    [
      ["airport", 1, "#F44336"],
      ["iho", 2, "#F44336"],
      ["hyeopjae", 3, "#F44336"],
    ],
  );
  // 장소가 없는 8/15에는 경로가 없다
  assert.deepEqual(
    routes.map((route) => route.dayPathId),
    ["d12", "d13", "d14"],
  );
  assert.deepEqual(routes[0].coordinates[0], [126.4914, 33.5104]);
});

test("가고 싶은 곳은 경로 없이 회색 마커로만 나온다", () => {
  const { markers, routes } = modelOf(jejuSeed);
  const seongsan = markers.find((marker) => marker.pathId === "seongsan");

  assert.equal(seongsan?.color, "#6B7280");
  assert.equal(seongsan?.dayPathId, null);
  assert.ok(routes.every((route) => route.dayPathId !== "wish"));
});

test("과제대로 동문시장을 8/12 공항과 이호테우 사이로 옮기면 번호와 경로가 따라 바뀐다", () => {
  const moved = jejuSeed.map((node) =>
    node.pathId === "dongmun" ? { ...node, parentPathId: "d12", position: 0.15 } : node,
  );
  const { markers, routes } = modelOf(moved);

  assert.deepEqual(
    markers.filter((marker) => marker.dayPathId === "d12").map(({ pathId, number }) => [pathId, number]),
    [
      ["airport", 1],
      ["dongmun", 2],
      ["iho", 3],
      ["hyeopjae", 4],
    ],
  );
  // 8/14에는 함덕해변 하나만 남아 경로선이 사라진다
  assert.deepEqual(
    routes.map((route) => route.dayPathId),
    ["d12", "d13"],
  );
});

test("장소를 고르면 그 점으로, Day를 고르면 그 Day 장소 전체로 카메라를 맞춘다", () => {
  assert.deepEqual(modelOf(jejuSeed, { selectedItemId: "iho" }).focus, {
    pathId: "iho",
    kind: "point",
    coordinates: [[126.4531, 33.4979]],
  });

  const dayFocus = modelOf(jejuSeed, { selectedItemId: "d13" }).focus;
  assert.equal(dayFocus?.kind, "bounds");
  assert.equal(dayFocus?.coordinates.length, 2);
});

test("hover 중인 마커와 경로를 표시한다", () => {
  const { markers, routes } = modelOf(jejuSeed, { hoveredItemId: "d14" });
  assert.ok(routes.find((route) => route.dayPathId === "d14")?.isHovered);
  assert.ok(markers.every((marker) => !marker.isHovered));
});

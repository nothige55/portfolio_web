// 드래그 중 잡은 장소를 놓일 자리에 끼운 행이 지도 순서의 기준이 된다
import assert from "node:assert/strict";
import { test } from "node:test";

import { withDragPreview } from "./with-drag-preview.ts";

const rows = [
  { pathId: "a", parentPathId: "day1", position: 1 },
  { pathId: "b", parentPathId: "day1", position: 2 },
  { pathId: "c", parentPathId: "day2", position: 1 },
];
const order = (result, parentPathId) =>
  result
    .filter((row) => row.parentPathId === parentPathId)
    .toSorted((x, y) => x.position - y.position)
    .map((row) => row.pathId);

test("목적지가 없으면 행을 그대로 둔다", () => {
  assert.equal(withDragPreview(rows, null), rows);
  assert.equal(withDragPreview(rows, { activePathId: "a", destination: null }), rows);
});

test("다른 날짜의 원하는 자리로 옮긴다", () => {
  const result = withDragPreview(rows, { activePathId: "a", destination: { parentPathId: "day2", siblingIndex: 0 } });
  assert.deepEqual(order(result, "day2"), ["a", "c"]);
  assert.deepEqual(order(result, "day1"), ["b"]);
});

test("같은 날짜 안에서 순서를 바꾼다", () => {
  const result = withDragPreview(rows, { activePathId: "a", destination: { parentPathId: "day1", siblingIndex: 1 } });
  assert.deepEqual(order(result, "day1"), ["b", "a"]);
});

test("인덱스가 범위를 벗어나면 맨 앞이나 맨 뒤로 맞춘다", () => {
  const end = withDragPreview(rows, { activePathId: "a", destination: { parentPathId: "day2", siblingIndex: 9 } });
  assert.deepEqual(order(end, "day2"), ["c", "a"]);
  const start = withDragPreview(rows, { activePathId: "a", destination: { parentPathId: "day2", siblingIndex: -3 } });
  assert.deepEqual(order(start, "day2"), ["a", "c"]);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { handPosition, judge } from "./hand-orientation.ts";

test("가운데는 가운데 칸", () => {
  assert.deepEqual(judge({ roll: 0, pitch: 0 }), { kind: "ok", key: "1-2" });
});
test("격자 경계 안쪽은 ok, 바로 밖은 edge로 가장자리 칸", () => {
  assert.deepEqual(judge({ roll: 25, pitch: 27 }), { kind: "ok", key: "2-4" });
  assert.deepEqual(judge({ roll: 26, pitch: 0 }), { kind: "edge", key: "1-4" });
  assert.deepEqual(judge({ roll: 0, pitch: -28 }), { kind: "edge", key: "0-2" });
});
test("인식 한계까지는 담고, 넘으면 풀림", () => {
  assert.equal(judge({ roll: 54, pitch: 30 }).kind, "edge");
  assert.deepEqual(judge({ roll: 55, pitch: 0 }), { kind: "lost", key: "" });
  assert.deepEqual(judge({ roll: 0, pitch: -31 }), { kind: "lost", key: "" });
});
test("칸 경계: roll -5°는 가운데 칸, -6°는 왼쪽 칸", () => {
  assert.equal(judge({ roll: -5, pitch: 0 }).key, "1-2");
  assert.equal(judge({ roll: -6, pitch: 0 }).key, "1-1");
});
test("손 위치는 격자 안으로 잘린다", () => {
  assert.deepEqual(handPosition({ roll: 0, pitch: 0 }), { x: 0.5, y: 0.5 });
  assert.deepEqual(handPosition({ roll: 70, pitch: 45 }), { x: 1, y: 0 });
  assert.deepEqual(handPosition({ roll: -25, pitch: -27 }), { x: 0, y: 1 });
});

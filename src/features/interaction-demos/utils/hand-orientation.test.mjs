import assert from "node:assert/strict";
import { test } from "node:test";
import { handPosition, judge, tiltAngle } from "./hand-orientation.ts";

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
test("tiltAngle: 범위 안에서는 더한 각도를 돌려준다", () => {
  assert.deepEqual(tiltAngle({ roll: 0, pitch: 0 }, 10, -5), { roll: 10, pitch: -5 });
});
test("tiltAngle: 한계(roll ±70°, pitch ±45°)에서 더 못 가면 null", () => {
  assert.equal(tiltAngle({ roll: 70, pitch: 0 }, 5, 0), null);
  assert.equal(tiltAngle({ roll: 0, pitch: -45 }, 0, -3), null);
  assert.deepEqual(tiltAngle({ roll: 68, pitch: 0 }, 5, 0), { roll: 70, pitch: 0 });
});
test("tiltAngle: 한 축이 한계여도 다른 축은 움직인다", () => {
  assert.deepEqual(tiltAngle({ roll: 70, pitch: 0 }, 5, 10), { roll: 70, pitch: 10 });
});

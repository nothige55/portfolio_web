import assert from "node:assert/strict";
import { test } from "node:test";
import { blocksRepeat, handPosition, judge, tiltAngle } from "./hand-orientation.ts";

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
test("tiltAngle: 격자 밖에서 바깥으로 갈 때만 roll이 3배, pitch는 그대로", () => {
  assert.deepEqual(tiltAngle({ roll: 25, pitch: 0 }, 5, 5), { roll: 40, pitch: 5 });
  assert.deepEqual(tiltAngle({ roll: -30, pitch: 0 }, -2, 0), { roll: -36, pitch: 0 });
  assert.deepEqual(tiltAngle({ roll: -30, pitch: 0 }, 2, 0), { roll: -28, pitch: 0 });
  assert.deepEqual(tiltAngle({ roll: 26, pitch: 0 }, -5, 0), { roll: 21, pitch: 0 });
  assert.deepEqual(tiltAngle({ roll: 20, pitch: 0 }, 5, 0), { roll: 25, pitch: 0 });
});
test("tiltAngle: 한 축이 한계여도 다른 축은 움직인다", () => {
  assert.deepEqual(tiltAngle({ roll: 70, pitch: 0 }, 5, 10), { roll: 70, pitch: 10 });
});
test("blocksRepeat: 방금 담은 칸은 막고, 다른 칸이 다 찼으면 풀어 준다", () => {
  const full = {};
  for (let p = 0; p < 3; p++) for (let r = 0; r < 5; r++) full[`${p}-${r}`] = 2;
  assert.equal(blocksRepeat({ "1-2": 1 }, "1-2", "1-2"), true);
  assert.equal(blocksRepeat({ "1-2": 1 }, "1-3", "1-2"), false);
  assert.equal(blocksRepeat({ ...full, "1-2": 1 }, "1-2", "1-2"), false);
});

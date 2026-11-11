import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedDepths, applyDrop, canContain, initialRows as rows, locate, placesInOrder, resolveByDepth, resolveInside } from "./tree-drop.ts";

const labels = (r) => r.map((x) => x.label);

test("canContain: 장소는 날짜·그룹에만, 폴더·장소 아래에는 안 된다", () => {
  assert.equal(canContain("day", "place"), true);
  assert.equal(canContain("group", "place"), true);
  assert.equal(canContain("folder", "place"), false);
  assert.equal(canContain("place", "place"), false);
  assert.equal(canContain("folder", "day"), true);
  assert.equal(canContain("day", "day"), false);
  assert.equal(canContain("day", "group"), true);
  assert.equal(canContain("folder", "group"), false);
});

test("locate: 구역 경계 (rowHeight 30)", () => {
  assert.equal(locate(rows, 2, 30), null);
  assert.deepEqual(locate(rows, 45, 30), { kind: "inside", id: "day1" });
  assert.deepEqual(locate(rows, 70, 30), { kind: "slot", afterId: "day1" });
  assert.deepEqual(locate(rows, 80, 30), { kind: "slot", afterId: "airport" });
  assert.deepEqual(locate(rows, 95, 30), { kind: "slot", afterId: "airport" });
  assert.equal(locate(rows, -5, 30), null);
  assert.deepEqual(locate(rows, 1000, 30), { kind: "slot", afterId: "day2" });
});

test("allowedDepths: 동문시장을 끌 때 슬롯별 허용 깊이", () => {
  const d = (after) => allowedDepths(rows, "dongmun", after);
  assert.deepEqual(d("hyeopjae"), [2, 3]);
  assert.deepEqual(d("airport"), [2]);
  assert.deepEqual(d("coast"), [3]);
  assert.deepEqual(d("iho"), [3]);
  assert.deepEqual(d("day1"), [2]);
  assert.deepEqual(d("day2"), [2]);
  assert.deepEqual(d("folder"), []);
  assert.deepEqual(d("dongmun"), [2, 3]); // 자기 자신 뒤는 바로 앞 행(협재) 뒤와 같다
});

test("resolveByDepth: 깊이에 따라 부모와 위치", () => {
  const r = (after, depth) => resolveByDepth(rows, "dongmun", after, depth);
  assert.deepEqual(r("hyeopjae", 3), { target: { parentId: "coast", index: 2 }, depth: 3, valid: true });
  assert.deepEqual(r("hyeopjae", 2), { target: { parentId: "day1", index: 2 }, depth: 2, valid: true });
  assert.deepEqual(r("hyeopjae", 1), { target: { parentId: "folder", index: 1 }, depth: 1, valid: false });
  assert.deepEqual(r("hyeopjae", 9), r("hyeopjae", 3));
  assert.deepEqual(r("hyeopjae", 2.4), r("hyeopjae", 2));
  assert.deepEqual(r("airport", 2), { target: { parentId: "day1", index: 1 }, depth: 2, valid: true });
  assert.deepEqual(r("day2", 2), { target: { parentId: "day2", index: 0 }, depth: 2, valid: true });
  assert.deepEqual(r("day2", 1), { target: { parentId: "folder", index: 2 }, depth: 1, valid: false });
});

test("resolveInside: 컨테이너 안으로", () => {
  const r = (id) => resolveInside(rows, "dongmun", id);
  assert.deepEqual(r("day2"), { target: { parentId: "day2", index: 0 }, depth: 2, valid: true });
  assert.deepEqual(r("day1"), { target: { parentId: "day1", index: 2 }, depth: 2, valid: true });
  assert.deepEqual(r("coast"), { target: { parentId: "coast", index: 2 }, depth: 3, valid: true });
  assert.deepEqual(r("folder"), { target: { parentId: "folder", index: 2 }, depth: 1, valid: false });
  assert.equal(r("airport"), null);
});

test("applyDrop: 이동 결과와 깊이, 원본 불변", () => {
  const a = applyDrop(rows, "dongmun", { parentId: "day1", index: 1 });
  assert.deepEqual(labels(a), ["제주 여행", "1일차", "공항", "동문시장", "해안 코스", "이호테우", "협재해수욕장", "2일차"]);
  assert.equal(a.find((x) => x.id === "dongmun").depth, 2);
  const b = applyDrop(rows, "dongmun", { parentId: "coast", index: 2 });
  assert.deepEqual(labels(b), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "협재해수욕장", "동문시장", "2일차"]);
  assert.equal(b.find((x) => x.id === "dongmun").depth, 3);
  const c = applyDrop(rows, "dongmun", { parentId: "day2", index: 0 });
  assert.deepEqual(labels(c), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "협재해수욕장", "2일차", "동문시장"]);
  assert.equal(c.find((x) => x.id === "dongmun").depth, 2);
  assert.deepEqual(labels(rows), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "협재해수욕장", "동문시장", "2일차"]);
});

test("원래 자리에 놓으면 순서가 그대로", () => {
  const r = resolveByDepth(rows, "dongmun", "dongmun", 2);
  assert.deepEqual(labels(applyDrop(rows, "dongmun", r.target)), labels(rows));
});

test("어떤 이동에도 장소는 4개 그대로", () => {
  for (const t of [{ parentId: "day1", index: 1 }, { parentId: "coast", index: 0 }, { parentId: "day2", index: 0 }]) {
    const out = placesInOrder(applyDrop(rows, "dongmun", t));
    assert.equal(out.length, 4);
    assert.equal(new Set(out).size, 4);
  }
  assert.deepEqual(placesInOrder(rows), ["공항", "이호테우", "협재해수욕장", "동문시장"]);
});

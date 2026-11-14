import assert from "node:assert/strict";
import { test } from "node:test";
import calcNewPosition from "./calc-new-position.ts";

const item = (pathId, parentPathId, position) => ({
  pathId,
  parentPathId,
  position,
  name: pathId,
  hierarchy: 0,
});

const closeTo = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

// p 아래 형제 A(0.1) B(0.2) C(0.3), C 아래 손주 c1
const items = [
  item("p", null, 0.1),
  item("A", "p", 0.1),
  item("B", "p", 0.2),
  item("C", "p", 0.3),
  item("c1", "C", 0.1),
  item("empty", null, 0.5),
];
const byId = (id) => items.find((i) => i.pathId === id);

test("계층 탈출: 조상이 마지막 형제면 조상 뒤에 놓인다 (원본은 0.2를 써서 0.25, 즉 조상 앞)", () => {
  const position = calcNewPosition({
    items,
    overItem: byId("c1"),
    position: "bottom",
    newParentPathId: "p",
    ancestor: byId("C"),
  });
  assert.ok(position > 0.3, `${position}`);
});

test("계층 탈출: 조상 다음 형제가 있으면 둘 사이", () => {
  closeTo(
    calcNewPosition({
      items,
      overItem: byId("c1"),
      position: "bottom",
      newParentPathId: "p",
      ancestor: byId("B"),
    }),
    0.25,
  );
});

test("첫 자식: 자식이 없는 컨테이너에는 0.1 (원본은 siblings[0]이 없어 멈춤)", () => {
  assert.equal(
    calcNewPosition({
      items,
      overItem: byId("empty"),
      position: "firstChild",
      newParentPathId: "empty",
      ancestor: undefined,
    }),
    0.1,
  );
});

test("가운데: 마지막 자식 뒤에 붙고, 비었으면 0.1", () => {
  closeTo(
    calcNewPosition({ items, overItem: byId("p"), position: "middle", newParentPathId: "p", ancestor: undefined }),
    0.4,
  );
  assert.equal(
    calcNewPosition({ items, overItem: byId("empty"), position: "middle", newParentPathId: "empty", ancestor: undefined }),
    0.1,
  );
});

test("위·아래: 첫 형제 위는 절반, 마지막 형제 아래는 +0.1", () => {
  closeTo(
    calcNewPosition({ items, overItem: byId("A"), position: "top", newParentPathId: "p", ancestor: undefined }),
    0.05,
  );
  closeTo(
    calcNewPosition({ items, overItem: byId("C"), position: "bottom", newParentPathId: "p", ancestor: undefined }),
    0.4,
  );
});

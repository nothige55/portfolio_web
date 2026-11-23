// 타이핑 제목이 자모 단위로 한 글자씩 조합되는 중간 상태를 만드는지 확인한다.
import assert from "node:assert/strict";
import { test } from "node:test";

import { jamoSteps } from "./jamo-steps.ts";

test("받침 없는 글자는 자음 → 모음 순서로 붙는다", () => {
  assert.deepEqual(jamoSteps("이"), ["", "ㅇ", "이"]);
});

test("받침은 다음 글자 첫 자음처럼 먼저 붙었다가 앞 글자에 합쳐진다", () => {
  assert.deepEqual(jamoSteps("움직"), ["", "ㅇ", "우", "움", "움ㅈ", "움지", "움직"]);
});

test("한글이 아닌 글자와 공백은 그대로 한 번에 붙는다", () => {
  assert.deepEqual(jamoSteps("UI 가"), ["", "U", "UI", "UI ", "UI ㄱ", "UI 가"]);
});

test("마지막 상태는 항상 원래 단어이고, 조합되지 않은 옛 자모가 섞이지 않는다", () => {
  for (const word of ["움직이는지", "반응하는지", "이어지는지"]) {
    const steps = jamoSteps(word);
    assert.equal(steps.at(-1), word);
    assert.ok(steps.every((s) => !/[ᄀ-ᇿ]/.test(s)), `${word}에 조합되지 않은 자모가 있음`);
  }
});

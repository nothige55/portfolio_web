# 통합 DnD 데모 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 `DragStory`의 평평한 목록 데모를 폴더 → 날짜 → 그룹 → 장소 트리로 바꾸고, 세 단계(V1~V3 / V4 / V5~V6)에서 판정·피드백·자식 넣기가 어떻게 바뀌었는지 직접 끌어서 보게 한다.

**Architecture:** 드롭 규칙을 UI 밖 순수 모듈(`tree-drop.ts`)로 만들어 Node 내장 테스트로 고정한다. `TreeDemo` 컴포넌트가 그 모듈 위에서 세 모드(`line`, `magnet`, `fill`)로 동작하고, `DragStory`는 행 상태를 들고 지도에 장소 순서를 넘긴다. 지도(`JejuMap`)는 바꾸지 않는다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, GSAP ScrollTrigger(기존), Node 내장 테스트 러너(`npm test`).

**Spec:** `docs/superpowers/specs/2026-11-11-dnd-integrated-demo-design.md`

## Global Constraints

- 새 의존성을 넣지 않는다. 포인터 이벤트로 만든다(지금 `SortableDemo`와 같은 방식).
- `DragStory`의 화면 고정과 스크롤 연동, 단계 버튼 `V1~V3 / V4 / V5~V6`, 데스크톱 전용 연동과 좁은 화면·움직임 줄이기 대체 동작을 유지한다.
- 끌 수 있는 것은 장소(`place`)뿐이다. 날짜·폴더·그룹은 끌지 않는다.
- 놓을 수 있는 곳: 장소는 날짜 또는 그룹의 자식이다. 폴더 바로 아래와 장소 아래에는 놓을 수 없다. 날짜는 폴더 아래, 그룹은 날짜 아래에만 있다.
- 시간 값: 자식으로 넣는 머무름 지연은 `line` 0ms, `magnet` 500ms, `fill` 1000ms. 데드존은 7.5px.
- 홈의 구간 id와 경로 바는 바꾸지 않는다. `/dnd`, `/about`은 건드리지 않는다.
- 이번 계획에서 "실제 Trego처럼 다듬기"는 하지 않는다(스펙의 4단계, 별도 계획).
- 커밋 메시지는 실행 환경이 정한 attribution 줄로 끝낸다.

> 테스트 단언(Task 1·2)은 버리는 구현으로 한 번 돌려 전부 통과함을 확인했다. 구현자가 규칙 정의대로 쓰면 같은 값이 나온다.

## Review Focus

1. 놓을 수 없는 곳(폴더 바로 아래, 장소 위)에 놓으면 행이 바뀌지 않고 미리보기도 없어야 한다. (Task 1 `valid: false`, Task 3 브라우저)
2. 끌었다가 원래 자리에 놓으면 순서가 그대로여야 한다. (Task 1)
3. 어떤 이동을 해도 지도에 넘기는 장소는 4개 그대로이고 중복이 없어야 한다. (Task 1)
4. 마우스 없이 방향키로도 같은 이동을 할 수 있어야 한다. 지금 `SortableDemo`가 지원하는 기능이다. (Task 2)
5. 끄는 도중 포인터가 취소되면(터치 취소, 창 밖으로 나감) 원래대로 돌아가야 한다. 375px에서 가로 스크롤이 생기면 안 된다. (Task 3 브라우저)

---

### Task 1: 드롭 규칙 모듈 (V1~V3 판정)

**Files:**
- Create: `src/features/interaction-demos/utils/tree-drop.ts`
- Test: `src/features/interaction-demos/utils/tree-drop.test.mjs`

**Interfaces:**
- Produces (모두 `tree-drop.ts`에서 export):
  - `type Kind = "folder" | "day" | "group" | "place"`
  - `type Row = { id: string; kind: Kind; label: string; depth: number }` (깊이: 폴더 0, 날짜 1, 그룹·날짜 직속 장소 2, 그룹 안 장소 3)
  - `type StepMode = "line" | "magnet" | "fill"`
  - `type Target = { parentId: string; index: number }` — `index`는 끄는 행을 뺀 부모의 자식 목록에서의 위치.
  - `type Resolved = { target: Target; depth: number; valid: boolean }`
  - `type Located = { kind: "inside"; id: string } | { kind: "slot"; afterId: string }`
  - `INDENT = 22`, `initialRows: readonly Row[]` (아래 트리)
  - `canContain(parent: Kind, child: Kind): boolean`
  - `locate(rows: readonly Row[], y: number, rowHeight: number): Located | null`
  - `allowedDepths(rows: readonly Row[], dragId: string, afterId: string): number[]`
  - `resolveByDepth(rows, dragId, afterId, depth: number): Resolved | null`
  - `resolveInside(rows, dragId, containerId: string): Resolved | null`
  - `applyDrop(rows: readonly Row[], dragId: string, target: Target): Row[]`
  - `placesInOrder(rows: readonly Row[]): string[]` (장소 라벨, 행 순서)
- 초기 트리(`initialRows`, 위에서 아래): `folder` "제주 여행" 0, `day1` "1일차" 1, `airport` "공항" 2, `coast`(group) "해안 코스" 2, `iho` "이호테우" 3, `hyeopjae` "협재해수욕장" 3, `dongmun` "동문시장" 2, `day2` "2일차" 1. id는 괄호 앞 영문 id, 장소의 라벨은 지도(`JejuMap`)가 쓰는 키와 같아야 한다.

규칙 정의(구현자가 몸통을 쓴다):
- `locate`: 행은 위에서부터 `rowHeight`씩 쌓인다. 행 안에서의 비율 f가 컨테이너 행(`folder`·`day`·`group`)이면 0.25 ≤ f ≤ 0.75가 `inside`, 그 밖은 f < 0.5 이면 "바로 앞 행 뒤"(첫 행 위는 `null`), 아니면 "그 행 뒤"다. 장소 행은 f < 0.5 / 그 이상으로 나눈다. `y`가 음수면 `null`, 마지막 행 아래면 마지막 행 뒤.
- 슬롯 `afterId`가 끄는 행 자신이면 끄는 행의 바로 앞 행 뒤로 본다. `inside`가 끄는 행 자신이면 `null`.
- `allowedDepths`: 끄는 행을 뺀 목록에서 `afterId` 행 뒤의 슬롯. 최대 깊이는 그 행의 깊이(그 행이 컨테이너면 +1), 최소 깊이는 다음 행의 깊이(없으면 1). 후보 깊이마다 부모(거슬러 올라가 처음 만나는 깊이 k-1 행)가 장소를 담을 수 있을 때만 남기고 오름차순으로 돌려준다.
- `resolveByDepth`: `depth`를 반올림해 최소~최대 범위로 자른 뒤 부모와 `index`를 계산한다. `valid`는 부모가 장소를 담을 수 있는지다(`allowedDepths`에 든 깊이인지와 같다). 허용 깊이가 없는 슬롯에서도 `null`이 아니라 `valid: false`로 돌려준다.
- `resolveInside`: 컨테이너가 아니면 `null`. 그 외에는 `index`가 끄는 행을 뺀 자식 수(맨 뒤에 추가)다.

- [ ] **Step 1: 실패하는 테스트 작성** — `tree-drop.test.mjs`(Node 26이 `.ts`를 그대로 import한다. `hand-orientation.test.mjs`와 같은 방식). 아래 단언을 모두 포함한다.

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: `tree-drop.test.mjs`가 모듈을 찾지 못해 FAIL. 기존 `hand-orientation` 테스트 5개는 PASS.

- [ ] **Step 3: `tree-drop.ts` 구현** — 위 Interfaces의 이름과 시그니처 그대로. 불변 갱신(입력 배열을 바꾸지 않는다). `applyDrop`은 끄는 행을 빼고 부모 자식 목록의 `index`에 넣은 뒤 깊이를 `부모 깊이 + 1`로 다시 쓴다(장소는 자손이 없다).

- [ ] **Step 4: 통과 확인**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: 테스트 전부 PASS, lint 오류 없음, `LayoutProps` 관련 기존 오류 외에 타입 오류 없음.

- [ ] **Step 5: Commit**

```bash
git add src/features/interaction-demos/utils/tree-drop.ts src/features/interaction-demos/utils/tree-drop.test.mjs
git commit -m "트리 드롭 규칙 모듈과 테스트 추가 (V1~V3 판정)"
```

---

### Task 2: V4 스냅, 머무름 타이밍, 키보드 이동

**Files:**
- Modify: `src/features/interaction-demos/utils/tree-drop.ts`
- Modify: `src/features/interaction-demos/utils/tree-drop.test.mjs`

**Interfaces:**
- Consumes: Task 1의 `allowedDepths`, `resolveByDepth`, `applyDrop`, `Row`, `Resolved`, `StepMode`.
- Produces:
  - `snapDepth(rows, dragId, afterId, depth: number): Resolved | null` — `allowedDepths` 중 `depth`에 가장 가까운 깊이로 `resolveByDepth`를 낸다. 같은 거리면 깊은 쪽. 허용 깊이가 없으면 `null`. (`depth`는 반올림하지 않은 값이다.)
  - `INSIDE_DELAY_MS: Record<StepMode, number>` = `{ line: 0, magnet: 500, fill: 1000 }`
  - `holdProgress(elapsedMs: number, delayMs: number): number` — 0~1. 지연이 0이면 1.
  - `canDropInside(elapsedMs: number, delayMs: number): boolean` — `holdProgress >= 1`.
  - `DEAD_ZONE_PX = 7.5`
  - `isWithinDeadZone(anchor: {x:number;y:number} | null, point: {x:number;y:number}): boolean` — 앵커가 없으면 `false`, 있으면 거리(유클리드)가 `DEAD_ZONE_PX` 미만일 때 `true`.
  - `moveByKey(rows, dragId, key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"): Row[] | null`

`moveByKey` 규칙: 끄는 행의 현재 슬롯은 "그 행 바로 앞 행 뒤", 현재 깊이는 그 행의 깊이다. 좌우는 현재 슬롯의 `allowedDepths`에서 현재 깊이보다 작은/큰 쪽의 가장 가까운 깊이로 옮긴다. 위는 끄는 행을 뺀 목록에서 현재 슬롯 행의 바로 앞 행 뒤 슬롯으로, 아래는 현재 슬롯 행의 바로 다음 행 뒤 슬롯으로 옮기고 그 슬롯의 가장 깊은 허용 깊이를 쓴다. 허용 깊이가 없는 슬롯은 건너뛰어 같은 방향으로 계속 간다. 갈 곳이 없으면 `null`.

- [ ] **Step 1: 실패하는 테스트 추가** — 아래 단언을 `tree-drop.test.mjs`에 더한다(import에 `snapDepth, INSIDE_DELAY_MS, holdProgress, canDropInside, isWithinDeadZone, moveByKey` 추가).

```js
test("snapDepth: 가장 가까운 허용 깊이로 붙는다", () => {
  const s = (after, depth) => snapDepth(rows, "dongmun", after, depth);
  assert.deepEqual(s("hyeopjae", 1), { target: { parentId: "day1", index: 2 }, depth: 2, valid: true });
  assert.equal(s("hyeopjae", 3.4).depth, 3);
  assert.equal(s("hyeopjae", 2.49).depth, 2);
  assert.equal(s("hyeopjae", 2.5).depth, 3); // 같은 거리면 깊은 쪽
  assert.equal(s("airport", 0).depth, 2);
  assert.equal(s("folder", 2), null);
});

test("머무름 지연과 진행도", () => {
  assert.deepEqual(INSIDE_DELAY_MS, { line: 0, magnet: 500, fill: 1000 });
  assert.equal(holdProgress(250, 500), 0.5);
  assert.equal(holdProgress(2000, 1000), 1);
  assert.equal(holdProgress(-5, 1000), 0);
  assert.equal(holdProgress(0, 0), 1);
  assert.equal(canDropInside(999, 1000), false);
  assert.equal(canDropInside(1000, 1000), true);
  assert.equal(canDropInside(0, 0), true);
});

test("데드존 7.5px", () => {
  assert.equal(isWithinDeadZone({ x: 0, y: 0 }, { x: 5, y: 5 }), true);
  assert.equal(isWithinDeadZone({ x: 0, y: 0 }, { x: 7.5, y: 0 }), false);
  assert.equal(isWithinDeadZone({ x: 0, y: 0 }, { x: 6, y: 6 }), false);
  assert.equal(isWithinDeadZone(null, { x: 1, y: 1 }), false);
});

test("moveByKey: 방향키로 같은 이동을 한다", () => {
  assert.deepEqual(labels(moveByKey(rows, "dongmun", "ArrowDown")), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "협재해수욕장", "2일차", "동문시장"]);
  assert.deepEqual(labels(moveByKey(rows, "dongmun", "ArrowUp")), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "동문시장", "협재해수욕장", "2일차"]);
  const right = moveByKey(rows, "dongmun", "ArrowRight");
  assert.deepEqual(labels(right), ["제주 여행", "1일차", "공항", "해안 코스", "이호테우", "협재해수욕장", "동문시장", "2일차"]);
  assert.equal(right.find((x) => x.id === "dongmun").depth, 3);
  assert.equal(moveByKey(rows, "dongmun", "ArrowLeft"), null);
  assert.equal(moveByKey(rows, "airport", "ArrowUp"), null);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: 새 테스트 4개 FAIL(내보내기가 없음). Task 1 테스트는 PASS.

- [ ] **Step 3: 위 시그니처대로 `tree-drop.ts`에 구현** — `snapDepth`는 `allowedDepths`와 `resolveByDepth`를 재사용한다.

- [ ] **Step 4: 통과 확인**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: 모든 테스트 PASS, 새 오류 없음.

- [ ] **Step 5: Commit**

```bash
git add src/features/interaction-demos/utils
git commit -m "트리 드롭 규칙에 V4 스냅, 머무름 타이밍, 방향키 이동 추가"
```

---

### Task 3: `TreeDemo` 컴포넌트와 V1~V3(`line`) 연결

**Files:**
- Create: `src/features/interaction-demos/components/tree-demo.tsx`
- Modify: `src/features/interaction-demos/components/drag-story.tsx`
- Modify: `src/config/content.ts` (`dragSteps`의 `mode` 값)
- Delete: `src/features/interaction-demos/components/sortable-demo.tsx` (마지막 단계에서, 가져다 쓰는 곳이 없어졌을 때)

**Interfaces:**
- Consumes: Task 1·2의 `Row`, `StepMode`, `initialRows`, `INDENT`, `locate`, `resolveByDepth`, `resolveInside`, `applyDrop`, `placesInOrder`, `moveByKey`.
- Produces:
  - `export type Preview = { order: string[]; label: string }` (기존 `sortable-demo`의 것과 같은 모양. `JejuMap`의 `preview` 속성과 구조가 맞다.)
  - `export function TreeDemo(props: { mode: StepMode; rows: readonly Row[]; onRowsChange: (rows: Row[]) => void; onPreview: (preview: Preview | null) => void }): JSX.Element`
  - `content.ts` `dragSteps`의 `mode`는 `"line" | "magnet" | "fill"`(a, b, c 순). `drag-story.tsx`의 `Step` 타입도 `StepMode`를 쓴다.

화면과 동작(이 작업에서는 `mode="line"` 동작만 완성한다):
- 행 높이 `ROW_H = 36`px, 들여쓰기는 `INDENT`. 행은 모두 절대 위치가 아니라 위에서 아래로 쌓고, 좌표 계산은 트리 컨테이너 기준 `getBoundingClientRect`로 한다.
- 끌기는 장소 행의 손잡이(`⋮⋮`)에서 시작하고 `setPointerCapture`를 쓴다. `touch-action: none`은 손잡이에만 건다(좁은 화면에서 목록 쪽 스크롤을 막지 않기 위해).
- `line` 모드: 끄는 동안 행은 움직이지 않고(끄는 행은 반투명), 포인터 위치로 `locate` → `resolveByDepth(rows, dragId, afterId, x / INDENT)` 또는 `resolveInside`를 부른다. 결과의 `depth`만큼 들여쓴 삽입선(`inside`면 컨테이너 행에 파란 외곽선)을 그린다. `valid: false`여도 선은 그리되 색을 달리하고, 놓으면 아무것도 바꾸지 않는다.
- `line` 모드에서 `inside`는 지연 없이 즉시 적용한다(`INSIDE_DELAY_MS.line`).
- 끌기가 끝나면 유효한 결과만 `onRowsChange(applyDrop(...))`. `pointercancel`이면 원래대로. 끄는 중에는 `onPreview`로 `{ order: placesInOrder(applyDrop(...)), label }`을 알린다(유효할 때만, 아니면 `null`).
- 키보드: 장소 행은 `tabIndex={0}`이고 방향키는 `moveByKey` 결과를 `onRowsChange`로 반영한다. `aria-label`에 현재 위치와 방향키 사용을 알린다.
- 하단: 상태 문구(`aria-live="polite"`)와 `처음으로` 버튼(`initialRows`로 되돌림).
- 임시 문구: `line` — "놓일 곳을 선으로 알려줘요". 문구 최종본은 사용자가 정한다.

`drag-story.tsx` 변경: `order` 상태를 `rows` 상태(`initialRows`)로 바꾸고, `JejuMap`에는 `order={placesInOrder(rows)}`와 `preview`를 넘긴다. `SortableDemo`와 `initialOrder` import를 `TreeDemo`로 교체한다. 지도 반응(점선 경로와 km 차이)은 `mode === "fill"`일 때만 넘기고, 그 외 단계에서는 `preview`를 `null`로 넘긴다.

- [ ] **Step 1: 타입 정리** — `content.ts`의 `dragSteps` mode를 `"line"`, `"magnet"`, `"fill"`로 바꾸고 `drag-story.tsx`의 `Step["mode"]`를 `StepMode`로 맞춘다. Run: `npx tsc --noEmit` Expected: 새 타입 오류가 없거나 `TreeDemo` 미정의 오류만.

- [ ] **Step 2: `tree-demo.tsx` 구현** — 위 시그니처와 `line` 동작. `magnet`/`fill` 모드는 이 시점에는 `line`과 같게 동작해도 된다(Task 4·5에서 채운다).

- [ ] **Step 3: `drag-story.tsx` 연결, `sortable-demo.tsx` 삭제**

- [ ] **Step 4: 정적 검증**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: 테스트 PASS, lint·빌드 성공, `LayoutProps` 외 타입 오류 없음.

- [ ] **Step 5: 브라우저 검증** (`npm run dev`, 홈의 Trego 드래그 구간, V1~V3 단계)
1. 장소 하나를 끌면 포인터 위치에 따라 삽입선이 위아래로, 가로 위치에 따라 들여쓰기가 바뀐다.
2. 날짜 행 가운데로 가면 외곽선이 생기고 놓으면 그 날짜의 마지막 자식이 된다.
3. 폴더 바로 아래 깊이에 두면 선 색이 달라지고, 놓아도 행이 그대로다. (Review Focus 1)
4. 원래 자리에 놓으면 순서가 그대로다. 끄는 도중 포인터를 창 밖으로 빼고 놓아도 원래대로다. (Review Focus 5)
5. 손잡이에 포커스 후 방향키로 이동한다.
6. 375px: 가로 스크롤이 없다. 콘솔 오류 없음.
7. 지도: V1~V3 단계에서는 점선 미리보기가 나오지 않는다. 놓은 뒤 지도의 장소 순서가 트리 순서와 같다.

- [ ] **Step 6: Commit**

```bash
git add src/features/interaction-demos src/config/content.ts
git commit -m "DragStory 데모를 트리로 교체하고 V1~V3 판정을 구현"
```

---

### Task 4: V4(`magnet`) — 허용 계층 스냅과 미리보기

**Files:**
- Modify: `src/features/interaction-demos/components/tree-demo.tsx`

**Interfaces:**
- Consumes: Task 2의 `snapDepth`, `INSIDE_DELAY_MS`, `holdProgress`, `canDropInside`, Task 1의 함수들.
- Produces: `TreeDemo`의 `mode="magnet"` 동작(시그니처 불변).

동작:
- 위치 판정(`locate`)은 항상 끌기 시작 전의 행 배치를 기준으로 한다(화면이 판정을 따라 움직여 흔들리는 되먹임을 피하려고).
- `snapDepth(rows, dragId, afterId, x / INDENT)`의 결과가 유효할 때, 표시용 행을 `applyDrop`으로 다시 배치한다: 끄는 행은 목표 위치로 옮겨 반투명 미리보기(`#E5F4FF` 계열, 점선 테두리)로 그리고, 나머지 행은 한 행 높이만큼 벌어진 자리를 연다(전환 약 200ms, `motion-safe`).
- 허용 깊이가 없는 곳(폴더 바로 아래 등)에서는 미리보기를 그리지 않고 원래 배치로 둔다. 놓아도 바뀌지 않는다.
- 허용 깊이 눈금: 목표 슬롯의 `allowedDepths`를 세로 점선(허용)과 굵은 선(선택됨)으로 트리 왼쪽에서 그린다.
- 자식 넣기: 컨테이너 행의 `inside` 구역에 포인터가 `INSIDE_DELAY_MS.magnet`(500ms) 이상 머물면 `resolveInside` 결과로 미리보기가 컨테이너 안에 붙는다. 그 전에는 슬롯 판정을 쓴다.
- 놓을 때는 표시된 미리보기와 같은 결과를 `onRowsChange`로 반영한다.
- 임시 문구: "놓을 수 있는 자리가 열려요".

- [ ] **Step 1: 구현** — 위 동작. 순수 규칙에 필요한 것이 더 생기면 `tree-drop.ts`에 순수 함수로 추가하고 테스트를 함께 쓴다(UI 안에 판정 로직을 두지 않는다).

- [ ] **Step 2: 정적 검증**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: 브라우저 검증** (V4 단계)
1. 포인터가 어디 있든 가까운 허용 깊이에 미리보기가 붙고, 가로로 움직이면 허용 깊이 사이에서만 바뀐다(그룹 마지막 뒤: 그룹 안 ↔ 날짜 직속).
2. 형제가 벌어져 자리가 열린다. 포인터를 흔들어도 행이 떨리지 않는다.
3. 폴더 바로 아래 같은 곳에서는 미리보기가 사라진다.
4. 날짜(2일차) 위에서 0.5초 머물면 안에 붙는다.
5. 놓은 결과가 미리보기와 같다. 방향키 이동은 그대로 동작한다.

- [ ] **Step 4: Commit**

```bash
git add src/features/interaction-demos/components/tree-demo.tsx src/features/interaction-demos/utils
git commit -m "V4 허용 계층 스냅, 자리 열기, 머무름 자식 넣기 구현"
```

---

### Task 5: V5~V6(`fill`) — 채움, 데드존, 지도 반응과 설명 문구

**Files:**
- Modify: `src/features/interaction-demos/components/tree-demo.tsx`
- Modify: `src/features/interaction-demos/components/drag-story.tsx` (지도 `preview` 전달 확인)
- Modify: `src/config/content.ts` (`dragSteps` 본문)
- Modify: `src/features/dnd/config/chapters.ts` (`feel` 문구 반영)

**Interfaces:**
- Consumes: Task 2의 `holdProgress`, `canDropInside`, `isWithinDeadZone`, `INSIDE_DELAY_MS`.
- Produces: `TreeDemo`의 `mode="fill"` 동작. `onPreview`는 이 모드에서만 지도가 쓴다(`DragStory`가 `mode === "fill"`일 때만 `JejuMap`에 넘긴다).

동작:
- `magnet`의 판정과 미리보기를 그대로 쓰되, 자식 넣기는 컨테이너 `inside` 구역에 머무는 동안 행 안쪽이 왼쪽부터 `holdProgress(elapsed, 1000)`만큼 채워지고, 다 차는 1초 뒤(`canDropInside`)에만 안으로 붙는다. 채우는 도중 포인터가 `inside` 구역을 벗어나면 채움이 즉시 사라지고 다시 시작한다.
- 데드존: 미리보기가 컨테이너 안에 붙어 행이 밀린 순간의 포인터 위치를 앵커로 잡고, 이후 `isWithinDeadZone(anchor, point)`인 동안은 판정을 다시 하지 않는다(7.5px 이상 움직이면 해제). 앵커는 다른 목표로 바뀌면 지운다.
- 지도: 이 모드에서 끄는 동안 `onPreview`가 유효한 목표의 장소 순서를 알려 `JejuMap`이 점선 경로와 km 차이를 보여 준다(놓기 전에는 지도가 바뀌지 않는다는 `JejuMap`의 기존 동작 유지).
- 임시 문구: "머물면 채워지고, 차면 안으로 들어가요".
- 세 축 표시(스펙 "바뀐 곳 표시"): 트리 아래에 판정·피드백·자식 넣기 세 칸을 한 줄씩 보여 주고, 이전 단계에서 바뀐 칸은 강조한다. 데이터는 `dragSteps`의 각 항목에 `axes: { judge: string; feedback: string; child: string }`와 `changed: readonly ("judge" | "feedback" | "child")[]`로 둔다. 값: a는 `changed: []`(기준 단계), b는 `["judge", "feedback", "child"]`, c는 `["feedback", "child"]`. 칸의 문구는 스펙 단계 표를 짧게 줄인 임시 문구이고 최종본은 사용자가 정한다. 이 표시는 모든 모드에서 보인다.
- 설명 문구(`dragSteps`)는 스펙의 단계 표에 따라 판정·피드백·자식 넣기가 이전 단계에서 어떻게 달라졌는지 한두 문장으로 쓴다. 기록에 있는 사실만 쓴다(채움 1초, 7.5px, 지도는 데모용 좌표). 최종 문구는 사용자가 정한다.

- [ ] **Step 1: 구현** — 위 동작. 시간 판정은 `performance.now()` 대신 `pointermove`와 `requestAnimationFrame` 중 하나로 일관되게 하고, 구현은 `holdProgress`와 `canDropInside`만 호출하게 한다.

- [ ] **Step 2: `dragSteps`에 `axes`·`changed` 추가, 세 축 표시 구현, 설명 문구와 `chapters.ts` 수정**

- [ ] **Step 3: 정적 검증**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: PASS, 빌드 성공.

- [ ] **Step 4: 브라우저 검증** (V5~V6 단계, 필요하면 임시로 시간을 느리게 해서 본다)
1. 빈 날짜 위에 머물면 안쪽이 왼쪽부터 채워지고 1초 뒤 안으로 붙는다. 채우는 중 벗어나면 채움이 사라진다.
2. 붙은 직후 7.5px보다 작게 움직이면 판정이 바뀌지 않고, 더 움직이면 바뀐다.
3. 끄는 동안 지도에 점선 경로와 km 차이가 나오고, 놓기 전에는 지도의 실선이 바뀌지 않는다. 놓으면 바뀐다.
4. 단계 버튼 `V1~V3 / V4 / V5~V6`로 오가도 트리 상태가 유지되고, V1~V3·V4에서는 지도 미리보기가 나오지 않는다.
5. 단계를 넘길 때 세 축 칸에서 바뀐 칸만 강조된다(V1~V3는 강조 없음, V4는 셋 다, V5~V6는 피드백과 자식 넣기).
6. 375px에서 가로 스크롤이 없고, 1024px 이상에서 화면 고정과 단계 전환이 예전처럼 동작한다. 콘솔 오류 없음.

- [ ] **Step 5: Commit**

```bash
git add src/features src/config/content.ts
git commit -m "V5~V6 채움, 데드존, 지도 반응과 단계 설명 문구 반영"
```

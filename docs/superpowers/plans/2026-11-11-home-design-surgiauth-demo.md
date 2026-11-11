# 홈 디자인 방향과 SurgiAuth 데모 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈을 "무대 + 수치 주석" 구성으로 바꾸고, SurgiAuth 데모를 손이 격자 위에서 기울며 칸으로 옮겨 가는 방식(시안 D)으로 다시 만든다.

**Architecture:** 판정 로직을 컴포넌트에서 순수 모듈로 떼어 Node 내장 테스트로 고정한다. `CoverageGrid`는 그 모듈을 쓰는 화면만 남긴다. 홈 전용 색 토큰은 `globals.css`의 `.home` 클래스 아래에 두고, `page.tsx` 안의 작은 지역 컴포넌트(`Stage`, `Notes`)로 구간을 조립한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, GSAP ScrollTrigger(기존), Node 26 내장 테스트 러너(`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-11-home-design-surgiauth-demo-design.md`

## Global Constraints

- 범위는 홈(`/`)뿐이다. `/dnd`, `/about`, `:root` 토큰, `layout.tsx`의 Noto Serif KR은 건드리지 않는다.
- 새 의존성을 넣지 않는다.
- 판정 값은 고정이다: 격자 roll ±25°(5칸, 칸 폭 10°), pitch ±27°(3칸, 칸 폭 18°), 인식 한계 roll ±54°, pitch ±30°, 칸마다 2장, 총 30장, 0.5초마다 1장. 손이 움직이는 범위는 roll ±70°, pitch ±45°.
- 파란색(`--primary`)은 만질 수 있는 것과 그 반응에만 쓴다.
- 스스로 움직이는 효과를 넣지 않는다. `DragStory`의 스크롤 고정은 그대로 둔다.
- 홈은 Pretendard만 쓰고 밝은 테마로 고정한다.
- 구간 id는 그대로다: `intro`, `trego`, `trego-drag`, `trego-nav`, `surgiauth`, `contact`.
- bulletproof 경계: features끼리 import 금지. `npm run lint`가 강제한다.
- 문구는 담백한 해요체. 임시 문구이고 사용자가 나중에 바꾼다.
- 커밋 메시지는 `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`로 끝낸다.

## Review Focus

1. 페이지를 내리던 방문자의 스크롤이 데모에 붙잡히면 안 된다. 포인터를 움직이지 않고 지나가면 휠은 페이지로 간다. (Task 2)
2. 각도가 한계(roll ±70°, pitch ±45°)에 닿은 뒤 같은 방향 휠은 페이지 스크롤로 넘어가야 한다. (Task 2)
3. 터치 화면에서 격자 위를 세로로 쓸면 페이지가 스크롤돼야 한다. 손 그림을 잡았을 때만 기울어진다. (Task 2)
4. 375px 폭에서 가로 스크롤이 생기거나 가장자리 칸의 손이 잘리면 안 된다. (Task 2, 3)
5. 경계값: roll 25°와 pitch 27°는 격자 안, roll 54°와 pitch 30°는 아직 인식 유지, 그 바로 밖은 풀림이다. (Task 1)

---

### Task 1: 판정 로직 분리와 테스트

**Files:**
- Create: `src/features/interaction-demos/utils/hand-orientation.ts`
- Test: `src/features/interaction-demos/utils/hand-orientation.test.mjs`
- Modify: `package.json` (scripts에 `"test": "node --test \"src/**/*.test.mjs\""` 추가)

**Interfaces:**
- Produces:
  - 상수 `ROLL_COLS = 5`, `PITCH_ROWS = 3`, `ROLL_RANGE = 50`, `PITCH_RANGE = 54`, `ROLL_LIMIT = 54`, `PITCH_LIMIT = 30`, `PER_CELL = 2`, `TOTAL = 30`, `SHOW_ROLL = 70`, `SHOW_PITCH = 45`
  - `type Angle = { roll: number; pitch: number }`
  - `clamp(v: number, lo: number, hi: number): number`
  - `judge(a: Angle): { kind: "ok" | "edge" | "lost"; key: string }` — `key`는 `"{pitch칸}-{roll칸}"`, 풀림이면 `""`. pitch칸 0이 가장 낮은 각도다.
  - `handPosition(a: Angle): { x: number; y: number }` — 격자 안에서 손의 위치를 0~1로 돌려준다. 격자 범위로 자른 뒤 계산한다. `x`는 왼쪽이 0, `y`는 위쪽이 0이고 pitch가 클수록 위다.

- [ ] **Step 1: 실패하는 테스트 작성**

테스트 파일은 `.mjs`로 두고 `./hand-orientation.ts`를 그대로 import한다(Node 26이 타입을 벗겨 실행한다. `.mjs`라서 `tsc`와 Next 빌드가 건드리지 않는다).

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL, `hand-orientation.ts`를 찾을 수 없다는 오류.

- [ ] **Step 3: `hand-orientation.ts` 구현**

`coverage-grid.tsx`에 있는 상수, `clamp`, `bucket`, `judge`를 그대로 옮긴다(동작을 바꾸지 않는다). `handPosition`만 새로 쓴다. 파일 맨 위에 값의 출처 주석(SurgiAuth `hand-orientation.ts`와 같다는 기존 주석)을 함께 옮긴다. `coverage-grid.tsx`는 이 단계에서 새 모듈을 import하도록만 바꾸고 화면은 그대로 둔다.

- [ ] **Step 4: 통과 확인**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: 테스트 5개 PASS, lint와 타입 오류 없음.

- [ ] **Step 5: Commit**

```bash
git add package.json src/features/interaction-demos
git commit -m "SurgiAuth 판정 로직을 순수 모듈로 분리하고 경계값 테스트 추가"
```

---

### Task 2: CoverageGrid를 시안 D로 다시 만들기

**Files:**
- Modify: `src/features/interaction-demos/components/coverage-grid.tsx` (전체 교체)

참고 목업: `.superpowers/brainstorm/13577-1794366902/content/surgi-hand-on-grid.html` (버리는 것. 동작 참고용이고 코드를 옮기지 않는다).

**Interfaces:**
- Consumes: Task 1의 `judge`, `handPosition`, `clamp`, 상수 전부, `Angle`.
- Produces: `export function CoverageGrid()` — props 없음. 바깥에 카드나 무대 배경을 그리지 않는다(무대는 Task 3이 감싼다).

- [ ] **Step 1: 화면 구조 교체**

없애는 것: 300px 손 무대, `rollPoint`, `pitchPoint`, `arc`, 호와 눈금 SVG, 슬라이더 `circle` 2개, `armed` 상태.

남기는 구조(위에서 아래):

1. 안내 한 줄: `격자 위에서 스크롤하세요. 좌우는 roll, 위아래는 pitch예요.`
2. 무대 `div`: `relative`, 좌우 `px-10`, 위아래 `py-9`(가장자리 칸의 손이 잘리지 않을 여백), `tabIndex={0}`, `aria-label="손 기울기. 방향키로 조절해요"`, 포커스 링 표시.
3. 무대 안 격자 감싸개 `div`(`relative mx-auto w-full max-w-[520px]`): 5×3 격자와 손이 여기 들어간다.
4. 격자: 칸 높이 `h-14 sm:h-20`. 칸마다 점 2개를 아래쪽에 둔다. 다 찬 칸은 `bg-primary/15`, 손이 있는 칸은 `ring-2 ring-inset ring-primary`. 위쪽 줄이 pitch가 큰 칸이다(기존 계산 `PITCH_ROWS - 1 - Math.floor(i / ROLL_COLS)` 유지).
5. 손: 기존 `Hand` SVG를 그대로 쓴다. 크기 `w-11 sm:w-14`, 격자 감싸개 기준 `absolute`, `left`와 `top`은 `handPosition` 값의 퍼센트, 중심 맞춤은 `-translate-x-1/2 -translate-y-1/2`를 감싸는 요소에 걸고 3D 기울기는 안쪽 요소에 건다(`perspective(260px) rotateX(pitch) rotateZ(roll)`). 풀림이면 `opacity: 0.35`, `grayscale(1)`.
6. 상태 문구(`aria-live="polite"`)와 `비우기` 버튼 한 줄.
7. 수치 줄: `roll n° · pitch n° · n / 30장`, `tabular-nums`.

전환 효과는 `motion-safe:` 접두로만 건다(손의 `opacity`, 칸의 `background`). 손의 위치와 기울기에는 전환을 걸지 않는다(입력을 그대로 따라가야 한다).

- [ ] **Step 2: 상태 문구**

우선순위 순서대로:

| 조건 | 문구 |
|---|---|
| 30장 | `30장을 다 모았어요` |
| 아직 조작 안 함 | `손을 기울여 보세요` |
| 풀림 | `open palm 인식이 풀렸어요. 이 프레임은 담지 않아요` |
| 현재 칸이 2장 | `이 칸은 찼어요. 다른 각도로 옮겨 보세요` |
| 가장자리 | `격자 밖이라 가장자리 칸에 담겨요` |
| 그 외 | `머물면 한 장씩 담겨요` |

담는 타이머(0.5초마다 1장, 칸마다 2장까지, 풀림이면 멈춤)는 기존 `useEffect`를 유지한다.

- [ ] **Step 3: 입력**

각도 변경은 한 함수로 모은다: `tilt(dRoll: number, dPitch: number): boolean` — `SHOW_ROLL`, `SHOW_PITCH`로 자르고, 실제로 바뀌었으면 `true`.

- 휠: 무대에 `passive: false` 리스너. 가로 성분이 크면 `tilt(deltaX * 0.15, 0)`, 아니면 `tilt(0, -deltaY * 0.1)`. `tilt`가 `true`일 때만 `preventDefault`(한계에서는 페이지로 넘어간다).
- 휠을 받는 조건: 무대 위에서 포인터가 **실제로 움직인 뒤**(`pointermove`의 `movementX`나 `movementY`가 0이 아님), 또는 무대가 포커스를 받았을 때 켠다. `pointerleave`와 `blur`에서 끈다. 스크롤 때문에 무대가 포인터 밑으로 들어온 경우에는 켜지지 않아야 한다. 이 값은 렌더에 쓰이지 않으니 `useRef`로 둔다.
- 끌기: 손 요소에만 `pointerdown`에서 `setPointerCapture`, `pointermove`에서 `tilt(movementX * 0.3, -movementY * 0.3)`. 손 요소에만 `touch-action: none`과 `cursor: grab`을 건다. 무대와 격자에는 `touch-action`을 걸지 않는다.
- 키보드: 무대 `keydown`에서 방향키로 5°씩. 좌우는 roll, 위는 pitch +, 아래는 pitch −. 처리했으면 `preventDefault`.

- [ ] **Step 4: 정적 검증**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: 모두 통과.

- [ ] **Step 5: 브라우저 검증**

`npm run dev`로 띄우고 홈의 SurgiAuth 구간에서 확인한다. 하나라도 어긋나면 고친 뒤 다시 본다.

1. 포인터를 무대 밖에 두고 페이지를 끝까지 휠로 내린다: 무대 위를 지나가도 손이 움직이지 않고 페이지가 멈추지 않는다.
2. 무대 위에서 포인터를 움직인 뒤 휠: 손이 기울며 칸으로 옮겨 가고 0.5초마다 점이 찬다.
3. 아래로 계속 휠: pitch −45°에서 멈추고 그다음 휠은 페이지를 내린다.
4. roll을 55° 넘게: 손이 흐려지고 점이 더 차지 않는다.
5. 무대에 Tab으로 포커스 후 방향키: 5°씩 기운다. 포커스 링이 보인다.
6. 375px 폭: 가로 스크롤 없음. 네 귀퉁이 칸에서 손이 잘리지 않는다.
7. 터치 에뮬레이션: 격자 위 세로 쓸기는 페이지 스크롤, 손을 잡고 끌면 기운다.
8. 콘솔 오류 없음.

- [ ] **Step 6: Commit**

```bash
git add src/features/interaction-demos/components/coverage-grid.tsx
git commit -m "SurgiAuth 데모를 손이 격자 위에서 기우는 방식으로 교체"
```

---

### Task 3: 홈을 무대 + 수치 주석 구성으로

**Files:**
- Modify: `src/app/globals.css` (`.home` 토큰 블록과 `--color-stage` 추가)
- Modify: `src/config/content.ts` (수치 주석 데이터 추가)
- Modify: `src/app/(home)/page.tsx`

**Interfaces:**
- Consumes: Task 2의 `CoverageGrid`(props 없음, 바깥 배경 없음).
- Produces:
  - `content.ts`: `type Note = { value: string; label: string }`, `export const surgiNotes: readonly Note[]`, `export const dragNotes: readonly Note[]`
  - `globals.css`: `.home` 클래스, Tailwind 색 `stage`(`bg-stage`)

- [ ] **Step 1: 토큰을 `globals.css`로 옮기기**

`@theme inline`에 `--color-stage: var(--stage);`를 추가한다. 파일 끝에 다음 블록을 둔다. `:root`는 건드리지 않는다.

```css
/* 홈 전용 토큰. :root를 바꾸면 /dnd, /about이 달라지므로 클래스 아래에 둔다. 밝은 테마 고정. */
.home {
  --background: #ffffff;
  --foreground: #191f28;
  --card: #ffffff;
  --muted: #f2f3f5;
  --muted-foreground: #6b7684;
  --border: #e5e8eb;
  --primary: oklch(0.55 0.2 260);
  --ring: oklch(0.55 0.2 260);
  --stage: #f2f3f5;
}
```

`page.tsx`의 바깥 `div`에서 인라인 `style`을 지우고 `className="home min-h-screen bg-background pb-32 pt-11 text-foreground"`로 바꾼다.

- [ ] **Step 2: 수치 주석 데이터**

`content.ts`에 추가한다. 값은 스펙에서 그대로 가져온다.

```ts
export type Note = { value: string; label: string };

export const surgiNotes: readonly Note[] = [
  { value: "±54° · ±30°", label: "roll과 pitch의 인식 한계예요. 넘으면 담지 않아요." },
  { value: "5 × 3", label: "roll 10°, pitch 18° 간격으로 나눈 칸이에요." },
  { value: "2장", label: "칸마다 채우는 수예요. 합쳐서 30장이에요." },
];

// 나머지 값은 사용자가 채운다. 실제 구현에서 나온 값만 넣는다.
export const dragNotes: readonly Note[] = [
  { value: "7.5px", label: "자동 펼침 직후, 이만큼 더 움직이기 전까지 드롭 판정을 미뤄요." },
];
```

- [ ] **Step 3: `page.tsx`에 지역 컴포넌트 두 개**

파일 안에만 둔다(홈에서만 쓴다).

- `Stage({ children }: { children: React.ReactNode })`: `rounded-[20px] bg-stage`, 안쪽 여백 `p-6 sm:p-12`, 테두리와 그림자 없음.
- `Notes({ items }: { items: readonly Note[] })`: `dl`로 그린다. `items`가 비면 아무것도 그리지 않는다. 넓은 화면에서 가로 열(`sm:grid-cols-3`), 좁은 화면에서 세로. 왼쪽 정렬. 수치는 `dt`에 `text-lg font-semibold tabular-nums`, 설명은 `dd`에 `text-sm text-muted-foreground`.

- [ ] **Step 4: 구간 재구성**

공통: 제목 상수 `big`은 `font-bold`, 자간 `-0.035em`으로 맞춘다. 구간 머리(기간·역할 줄, 이름, 한 줄 설명)는 가운데 정렬한다.

| 구간 | 바꾸는 것 |
|---|---|
| `intro` | 가운데 정렬. 제목과 설명 문단을 가운데로. 설명 문단은 `mx-auto max-w-md`. |
| `trego` | 가운데 정렬. 내용 그대로. |
| `trego-drag` | `DragStory`는 손대지 않는다. 그 아래에 `<Notes items={dragNotes} />`를 두고, `/dnd` 링크는 주석 아래에 둔다. |
| `trego-nav` | 2단 격자를 없앤다. 가운데 정렬한 라벨·제목·본문 → `Stage` 안에 `BreadcrumbDemo`(`mx-auto max-w-md`, 흰 카드 `rounded-xl bg-card p-6`로 감싼다). 주석은 두지 않는다(값이 아직 없다). |
| `surgiauth` | 2단 격자와 글머리 목록 4개를 없앤다. 가운데 정렬한 기간·역할, 이름, kicker, 한 줄(`인식기가 open palm으로 판정한 프레임만, 각도가 쏠리지 않게 칸마다 나눠 담았어요.`) → `Stage` 안에 `CoverageGrid` → `<Notes items={surgiNotes} />`. 기존의 조작 안내 `p`(`카메라 없이 스크롤…`)는 지운다(데모 안에 안내가 있다). |
| `contact` | 가운데 정렬. 내용 그대로. |

머리와 무대 사이 `mt-10`, 무대와 주석 사이 `mt-8`, 구간 위아래 `py-28`.

- [ ] **Step 5: 정적 검증**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: 모두 통과.

- [ ] **Step 6: 브라우저 검증**

`npm run dev`로 띄우고 확인한다.

1. 1280px: 구간마다 무대가 가장 큰 요소다. 파란색은 데모 안과 링크 포커스에만 보인다.
2. 경로 바: 스크롤하면 `trego-drag`, `trego-nav`에서 `Trego`가 붙고 나머지 구간에서는 사라진다.
3. `DragStory`: 1024px 이상에서 고정과 3단계 전환이 예전과 같다.
4. 375px: 가로 스크롤 없음. 주석이 세로로 쌓인다.
5. `/dnd`, `/about`: 변경 전과 같다(색, 세리프 제목).
6. 시스템 다크 모드에서 홈은 밝은 테마 그대로다.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/config/content.ts "src/app/(home)/page.tsx"
git commit -m "홈을 무대와 수치 주석 구성으로 재구성하고 홈 토큰을 globals.css로 이동"
```

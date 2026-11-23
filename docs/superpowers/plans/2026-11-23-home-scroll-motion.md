# 홈 스크롤 연출 추가 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **실행 모델:** Sonnet. subagent-driven으로 돌릴 때 구현 서브에이전트는 `model: "sonnet"`으로 띄운다.

**Goal:** 홈(`/`)에서 고정(pin) 구간 사이의 평범한 구간에 스크롤 진행도에 묶인 연출 네 가지를 더한다. 네 가지는 인트로 퇴장, 단어 블러 해제, 구간 등장, 연락처 무대 확장이다.

**Architecture:** 효과마다 작은 클라이언트 래퍼 컴포넌트를 하나씩 만들어 `src/features/interaction-demos/components/`에 둔다. `src/app/(home)/page.tsx`는 이 래퍼로 기존 마크업을 감싸기만 한다. GSAP 사용법은 기존 `SplitReveal`·`DragStory`와 같게 맞춘다. `useEffect` 안에서 `gsap.matchMedia()`를 쓰고, 정리는 `mm.revert()`로 하고, `document.fonts.ready.then(() => ScrollTrigger.refresh())`를 호출한다. 모든 효과는 `scrub`으로 스크롤에 묶는다. 시간이 흐르면서 혼자 재생되는 tween은 쓰지 않는다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, GSAP 3.15 + ScrollTrigger(이미 설치됨).

**Spec:** 별도 스펙 문서는 없다. 이 문서의 「후보와 결정」 절이 스펙이다. 참고한 분석 대상은 외부 포트폴리오 사이트(GSAP ScrollTrigger + Lenis)의 기법이다. 그 사이트의 디자인·문구·구성은 가져오지 않고 기법만 쓴다.

## 후보와 결정

| 후보 | 기법 | 결정 | 이유 |
|---|---|---|---|
| A. 인트로 퇴장 | 스크롤하면 제목이 위로 빠지며 작아지고 흐려짐 (scrub, pin 없음) | **Task 3** | 첫 스크롤에 바로 반응이 생긴다. 비용이 작다 |
| B. 단어 블러 해제 | 문단을 단어 `<span>`으로 쪼개 `opacity .15→1`, `blur(6px)→0`을 stagger + scrub | **Task 1** | 「Trego」 요약 문단처럼 읽게 할 문장에 맞는다 |
| C. 구간 등장 | 자식 요소가 `y:32, opacity 0`에서 올라옴 (scrub) | **Task 2** | Trego 머리말, SurgiAuth 수치, 연락처에 공통으로 쓴다 |
| D. 연락처 무대 확장 | 둥근 회색 카드가 `clip-path inset(...)`에서 전체 폭으로 펴짐 (scrub) | **Task 4** | 페이지 끝에 마무리 장면을 만든다. `DragStory`의 clip-path 기법과 같은 계열이다 |
| E. Lenis 부드러운 스크롤 | 휠 입력을 보간 | **보류** | 데모 안 세로 스크롤(`DragStory`의 `overflow-y-auto`, breadcrumb 데모)과 `DragStory.go()`의 `window.scrollTo`, `/trego` 목차 앵커와 충돌할 위험이 크다. 넣는다면 별도 계획에서 `data-lenis-prevent`부터 정리한다 |
| F. 가로 스크롤 트랙 | 세로 스크롤을 가로 이동으로 바꿈 | 제외 | 옆으로 늘어놓을 카드 묶음이 홈에 없다 |
| G. 타임라인 채우기·연도 고정 | 세로 선 `scaleY` + 활성 항목 | 제외 | 경력 타임라인이 사이트에 없다 |
| H. 시간 기반 등장(`toggleActions`) | 화면에 들어오면 0.9초 재생 | 제외 | 기존 스펙의 「스스로 움직이는 효과 금지」에 걸린다. C를 scrub으로 대신 쓴다 |

## Global Constraints

- 범위는 홈(`/`)뿐이다. `/trego`, `/about`, `/dnd`는 건드리지 않는다.
- 새 의존성을 넣지 않는다. `@gsap/react`도 넣지 않는다. 기존처럼 `useEffect`를 쓴다.
- `DragStory`, `SplitReveal`(pin 구간)의 안쪽에는 새 ScrollTrigger를 넣지 않는다. 새 효과는 pin 구간 바깥 요소에만 건다.
- 모든 효과는 `scrub`을 쓴다(`true` 또는 0.6). 시간 기반 재생(`toggleActions`, scrub 없는 `from`)은 쓰지 않는다.
- `prefers-reduced-motion: reduce`이면 효과를 걸지 않는다. 이때 내용은 처음부터 최종 상태(보이고, 선명하고, 제자리)여야 한다. `gsap.matchMedia()` 조건에 `(prefers-reduced-motion: no-preference)`를 넣는다.
- JS가 돌기 전이나 효과가 꺼진 상태에서 내용이 숨겨져 있으면 안 된다. 초기 숨김을 CSS 클래스로 미리 걸지 말고 GSAP `fromTo`로만 건다.
- 구간 id는 그대로 둔다: `intro`, `trego`, `trego-drag`, `trego-nav`, `surgiauth`, `contact`.
- bulletproof 경계: 새 컴포넌트는 `features/interaction-demos` 안에 두고, 다른 feature를 import하지 않는다. `npm run lint`가 강제한다.
- 각 컴포넌트 파일 첫 줄은 `"use client";`이고, `gsap.registerPlugin(ScrollTrigger);`를 모듈 최상단에서 호출한다(기존 파일과 같다).
- 주석은 기존 파일처럼 한국어로, 「왜」만 한 줄로 쓴다.
- 커밋 메시지는 한국어 제목 한 줄과 본문 불릿으로 쓰고, 실행 모델의 `Co-Authored-By:` 줄로 끝낸다.

## Review Focus

1. **pin 구간 아래 시작 위치 어긋남:** `DragStory`(`+=450%`)와 `SplitReveal`(`+=80%`)의 pin 여백보다 아래에 있는 트리거(SurgiAuth 수치, 연락처)는 pin 여백이 생긴 뒤의 위치에서 시작해야 한다. 확인 방법: 각 Task의 브라우저 검증에서 `ScrollTrigger.getAll()`의 `start` 값이 문서 순서대로 증가하는지 본다. (Task 2, 4)
2. **새로고침 위치:** `DragStory`가 `ScrollTrigger.clearScrollMemory("manual")`을 부르므로 새로고침하면 맨 위에서 시작한다. 이때 인트로가 반쯤 사라진 상태로 그려지면 안 된다. (Task 3)
3. **움직임 줄이기:** OS에서 움직임 줄이기를 켜면 네 효과 모두 꺼지고, 블러·투명도·clip-path가 남지 않아야 한다. (모든 Task의 검증 단계)
4. **375px 폭:** 가로 스크롤이 생기면 안 된다. 연락처 무대의 clip-path는 1024px 이상에서만 건다. 그보다 좁으면 평범한 회색 카드로 둔다. (Task 4)
5. **스크린리더:** 단어 `<span>`으로 쪼갠 문단이 한 문장으로 읽혀야 한다. 단어 사이에 실제 공백 텍스트 노드를 둔다. (Task 1)

---

### Task 1: 단어 블러 해제 `ScrubWords`

**Files:**
- Create: `src/features/interaction-demos/components/scrub-words.tsx`
- Modify: `src/app/(home)/page.tsx` (`#trego` 구간의 `trego.summary` 문단)

**Interfaces:**
- Produces: `export function ScrubWords({ text, className }: { text: string; className?: string }): JSX.Element`. 루트는 `<p>`이고 `className`을 그대로 받는다.

- [ ] **Step 1: `ScrubWords` 작성**

- 단어는 `text.trim().split(/\s+/)`로 나눈다. 각 단어는 `<span data-w className="inline-block">`으로 감싸고, 둘째 단어부터는 span 앞에 `{" "}` 공백을 텍스트 노드로 둔다.
- `useRef<HTMLParagraphElement>`를 루트에 건다. `gsap.matchMedia()` 조건은 `"(prefers-reduced-motion: no-preference)"`이고, 화면 폭 제한은 두지 않는다.
- 트윈 값:

```ts
gsap.fromTo(
  root.current.querySelectorAll("[data-w]"),
  { opacity: 0.15, filter: "blur(6px)" },
  {
    opacity: 1,
    filter: "blur(0px)",
    ease: "none",
    stagger: 0.1,
    scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom 55%", scrub: true },
  },
);
```

- 정리는 `mm.revert()`로 한다. 마운트할 때 `document.fonts.ready.then(() => ScrollTrigger.refresh())`를 호출한다.

- [ ] **Step 2: 홈에 적용**

`page.tsx`의 `#trego` 안 문단을 바꾼다.

```tsx
<p className="mx-auto max-w-lg leading-relaxed text-muted-foreground">{trego.summary}</p>
```

위 문단을 아래로 바꾼다.

```tsx
<ScrubWords text={trego.summary} className="mx-auto max-w-lg leading-relaxed text-muted-foreground" />
```

- [ ] **Step 3: 정적 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 4: 브라우저 검증**

`.claude/launch.json`의 dev 서버를 `preview_start`로 띄우고 1440×900에서 확인한다.
- `#trego`에 닿기 전에는 요약 문단의 단어가 흐리다. 스크롤을 내리면 앞 단어부터 선명해지고, 문단 아래가 화면 55% 지점에 오면 모두 선명하다.
- 검증용 JS: `[...document.querySelectorAll('#trego [data-w]')].map(e => getComputedStyle(e).opacity)`를 스크롤 위치별로 찍어 값이 순서대로 1에 다가가는지 본다.
- `resize_window`로 움직임 줄이기를 흉내 낼 수 없으면, `gsap.matchMedia` 조건을 일시적으로 바꾸지 말고 코드 리뷰로 확인한다.
- 접근성 트리(`read_page`)에서 문단이 한 문장으로 나오는지 본다.

- [ ] **Step 5: 커밋**

```bash
git add src/features/interaction-demos/components/scrub-words.tsx "src/app/(home)/page.tsx"
git commit
```

제목 예: `홈 Trego 요약 문단에 스크롤 단어 블러 해제 추가`

---

### Task 2: 구간 등장 `ScrollReveal`

**Files:**
- Create: `src/features/interaction-demos/components/scroll-reveal.tsx`
- Modify: `src/app/(home)/page.tsx` (`#trego` 머리말, `#surgiauth`의 `Notes`, `#contact` 내용)

**Interfaces:**
- Produces: `export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element`. 루트는 `<div>`이고, 효과는 직계 자식 각각에 stagger로 건다.

- [ ] **Step 1: `ScrollReveal` 작성**

- 대상은 `gsap.utils.toArray(root.current.children)`이다. 조건은 `"(prefers-reduced-motion: no-preference)"`이다.
- 트윈 값: `fromTo(items, { opacity: 0, y: 32 }, { opacity: 1, y: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 90%", end: "top 65%", scrub: 0.6 } })`
- 정리와 `fonts.ready` refresh는 Task 1과 같다.

- [ ] **Step 2: 홈에 적용 (세 곳)**

1. `#trego`: `<section>`은 그대로 두고, 안쪽의 label `<p>`, `<h2>`, kicker `<p>`를 `<ScrollReveal className="space-y-4">`로 감싼다. Task 1의 `ScrubWords`는 감싸지 않는다(효과가 겹치지 않게).
2. `#surgiauth`: `<div className="pb-20"><Notes items={surgiNotes} /></div>`를 `<ScrollReveal className="pb-20"><Notes items={surgiNotes} /></ScrollReveal>`로 바꾼다. 이 경우 직계 자식은 `<dl>` 하나다. 수치 세 개가 따로 올라오게 하려면 `Notes`를 바꾸지 말고 이 상태로 둔다(YAGNI).
3. `#contact`: Task 4에서 무대로 감싸므로 이 Task에서는 건드리지 않는다.

- [ ] **Step 3: 정적 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 4: 브라우저 검증 (Review Focus 1)**

- 1440×900에서 `#trego` 머리말과 SurgiAuth 수치가 화면 아래 90% 지점에 닿을 때부터 올라오기 시작하는지 본다.
- 검증용 JS: `ScrollTrigger`는 전역에 없으므로, 각 래퍼 루트의 `getBoundingClientRect().top`과 `opacity`를 스크롤 위치별로 찍는다. SurgiAuth 수치는 `SplitReveal`의 pin이 풀린 뒤에야 움직이기 시작해야 한다. pin 도중에 이미 다 올라와 있으면 시작 위치가 어긋난 것이다. 이때는 수치 래퍼의 트리거에 `refreshPriority: -1`을 준다. 앞선 pin들이 먼저 계산되게 하는 값이다.

- [ ] **Step 5: 커밋**

제목 예: `홈 Trego 머리말과 SurgiAuth 수치에 스크롤 등장 추가`

---

### Task 3: 인트로 퇴장 `IntroExit`

**Files:**
- Create: `src/features/interaction-demos/components/intro-exit.tsx`
- Modify: `src/app/(home)/page.tsx` (`#intro` 안의 `<div className="w-fit text-left">`)

**Interfaces:**
- Produces: `export function IntroExit({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element`. 루트는 `<div>`이고, 효과는 루트 자신에 건다.

- [ ] **Step 1: `IntroExit` 작성**

- 조건은 `"(prefers-reduced-motion: no-preference)"`이다.
- 트리거는 루트의 부모 `section#intro`가 아니라 루트 자신으로 둔다. feature가 page의 id를 알 필요가 없게 하기 위해서다.
- 트윈: `fromTo(root.current, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }, { opacity: 0, y: -60, scale: 0.94, filter: "blur(4px)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 30%", end: "bottom top", scrub: true } })`
- `transformOrigin: "left center"`를 준다. 제목이 `text-left`이기 때문이다.
- `TypedText`는 그대로 안에 둔다. 효과는 감싸는 div의 transform과 opacity에만 걸려서 타이핑 동작에 영향이 없다.

- [ ] **Step 2: 홈에 적용**

`<div className="w-fit text-left">…</div>`를 `<IntroExit className="w-fit text-left">…</IntroExit>`로 바꾼다.

- [ ] **Step 3: 정적 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 4: 브라우저 검증 (Review Focus 2)**

- 새로고침 직후(scrollY 0)에는 제목의 opacity가 1이고 blur가 없어야 한다. 검증용 JS: `getComputedStyle(document.querySelector('#intro > div')).opacity === "1"`
- 1440×900과 1440×600에서 확인한다. 화면이 낮으면 시작 시점(`top 30%`)이 이미 지나 있을 수 있다. 그때 0에서 opacity가 1이 아니면, `start`를 `"top top"`으로 바꾸고 다시 확인한다.
- `ScrollCue` 화살표가 사라지는 시점(40px)과 겹쳐도 어색하지 않은지 스크린샷으로 본다.

- [ ] **Step 5: 커밋**

제목 예: `홈 인트로 제목이 스크롤에 따라 흐려지며 빠지도록 추가`

---

### Task 4: 연락처 무대 확장 `ExpandStage` + README

**Files:**
- Create: `src/features/interaction-demos/components/expand-stage.tsx`
- Modify: `src/app/(home)/page.tsx` (`#contact`)
- Modify: `README.md` (`### 홈 — \`/\`` 절에 한 문장)

**Interfaces:**
- Consumes: Task 2의 `ScrollReveal`
- Produces: `export function ExpandStage({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element`. 루트는 `<div>`이다. 배경과 둥근 모서리는 호출하는 쪽에서 `className`으로 준다.

- [ ] **Step 1: `ExpandStage` 작성**

- 조건은 `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`이다. 홈의 다른 pin 효과가 쓰는 `lg` 기준과 같다.
- 트윈: `fromTo(root.current, { clipPath: "inset(10% 14% 10% 14% round 40px)" }, { clipPath: "inset(0% 0% 0% 0% round 20px)", ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.6, refreshPriority: -1 } })`
- 끝 값의 `round 20px`는 기존 `Stage`의 `rounded-[20px]`와 맞춘 것이다.

- [ ] **Step 2: 홈에 적용**

`#contact` 섹션의 클래스는 `space-y-6 py-14 text-center`에서 `py-14`로 바꾼다. 섹션 안쪽을 다음 구조로 바꾼다. 안쪽 요소(h2, 링크 묶음, stack, education)는 그대로 옮긴다.

```tsx
<ExpandStage className="rounded-[20px] bg-stage px-6 py-20 sm:py-28">
  <ScrollReveal className="space-y-6 text-center">{/* 기존 h2·링크·stack·education */}</ScrollReveal>
</ExpandStage>
```

- [ ] **Step 3: README 한 줄 추가**

`### 홈 — \`/\`` 절 끝에 다음 문장을 넣는다.

> 스크롤하면 첫 화면 제목이 흐려지며 빠지고, Trego 요약은 단어 단위로 선명해지며, 연락처는 회색 무대가 화면 폭으로 펴지면서 나와요. 움직임 줄이기 설정에서는 모두 꺼져요.

- [ ] **Step 4: 전체 검사**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: 모두 통과. 기존 테스트 6개 파일이 그대로 통과해야 한다.

- [ ] **Step 5: 브라우저 전체 검증 (Review Focus 1, 3, 4)**

- 1440×900에서 처음부터 끝까지 스크롤하며 확인한다. 인트로 퇴장, Trego 머리말 등장과 단어 해제, DragStory pin, SplitReveal pin 두 번, SurgiAuth 수치 등장, 연락처 무대 확장이 이 순서로 겹치지 않고 일어나야 한다. 구간마다 스크린샷을 한 장씩 남긴다.
- 375×812(`resize_window` mobile)에서 `document.documentElement.scrollWidth === innerWidth`인지 보고, 연락처 카드에 clip-path가 없는지 본다(`getComputedStyle(el).clipPath === "none"`).
- 콘솔 오류 0(`read_console_messages onlyErrors`).
- 움직임 줄이기는 브라우저 도구로 흉내 낼 수 없으면, 네 컴포넌트 모두에 `prefers-reduced-motion: no-preference` 조건이 있는지 grep으로 확인한다: `grep -L "prefers-reduced-motion: no-preference" src/features/interaction-demos/components/{scrub-words,scroll-reveal,intro-exit,expand-stage}.tsx`의 출력이 비어 있어야 한다.

- [ ] **Step 6: 커밋**

제목 예: `홈 연락처를 스크롤로 펴지는 무대로 바꾸고 README에 스크롤 연출 설명 추가`

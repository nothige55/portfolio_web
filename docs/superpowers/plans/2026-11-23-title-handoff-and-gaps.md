# 소개 → 데모 전환, 드래그 퇴장, Trego 링크 위치 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **실행 모델:** Sonnet.

**Goal:** 세 가지를 바꾼다.
1. 프로젝트 소개가 고정에서 풀린 뒤 다시 위로 스크롤되는 동작을 없앤다. 대신 소개가 고정된 채로 왼쪽 위로 작게 모이며 사라지고, 같은 스크롤 구간에서 다음 데모가 아래에서 빠르게 올라온다.
2. 드래그 데모가 끝난 뒤 생기는 빈 화면을 없앤다.
3. 「Trego에서 한 설계 보기」 링크를 Trego 구간 끝으로 옮긴다.

**Architecture:**
- **소개 → 데모 겹치기:** `ProjectTitle`의 고정 길이를 「등장 구간 + 화면 한 장」으로 늘린다. 그 바로 뒤에 오는 데모 블록에는 `lg:motion-safe:-mt-[100vh]`를 줘서, 소개 고정의 마지막 화면 한 장과 겹치게 한다. 이렇게 하면 소개는 끝까지 화면에 고정돼 있고, 데모만 아래에서 올라온다. 데모가 화면 위쪽에 닿는 순간 소개 고정이 끝나는데, 그때 소개는 이미 사라진 상태다.
- **드래그 퇴장:** 흐려지는 퇴장을 지운다. 고정이 풀리면 무대가 내용과 함께 그대로 위로 스크롤돼 나가고, 바로 뒤에 탐색 구간이 따라온다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, GSAP 3.15 ScrollTrigger.

**Spec:** 별도 스펙은 없다. 사용자 요청과 측정값이 근거다.
- 요청 1: 「프로젝트 소개를 고정시키고 스크롤시키는 만큼 다시 스크롤해서 올라가는 것도 부자연스럽다」, 「왼쪽 위로 모이면서 사라지면서 다음 데모가 쉭 나오는 구조」
- 요청 2: 드래그 데모가 사라진 뒤 탐색이 나올 때까지 빈 공간이 너무 많다.
- 측정(1024×768): 드래그 고정 끝(4998px), 링크(5025px), 탐색 제목(5405px) 사이가 약 1.5화면 비어 있다.

이전 계획서는 `docs/superpowers/plans/2026-11-23-project-intro-and-drag-entrance.md`이다.

## Global Constraints

- 블러(`filter: blur`)를 쓰지 않는다.
- 고정과 연출은 `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`에서만 건다. Tailwind 쪽 클래스는 같은 조건인 `lg:motion-safe:`를 쓴다. 그 밖의 환경에서는 겹침(음수 margin)도 없고 고정도 없는 정적 배치여야 한다.
- 초기 숨김을 CSS로 미리 걸지 않는다. GSAP `fromTo`로만 건다.
- 구간 id는 그대로 둔다.
- 새 의존성을 넣지 않는다.
- 커밋 메시지는 한국어 제목과 본문 불릿으로 쓰고 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`로 끝낸다.

## Review Focus

1. **소개가 다시 올라오면 안 된다:** 소개 고정이 끝나는 지점(데모가 화면 위쪽에 닿는 순간)에 소개의 opacity가 0이어야 한다. 그 뒤로는 소개가 다시 보이지 않아야 한다.
2. **겹침 순서:** 겹치는 동안 데모가 소개보다 위에 그려져야 한다(z-index). 소개의 고정 요소가 데모를 가리면 안 된다.
3. **고정 시작 위치:** 드래그 고정이 소개 고정이 끝나는 위치에서 바로 시작해야 한다. 확인 방법: `.pin-spacer` 위치를 출력해서, 드래그 spacer의 top이 소개 spacer의 bottom에서 100vh를 뺀 값과 같은지 본다.
4. **드래그 조작 가능 구간:** 등장 중에는 `inert`이고, 고정이 시작된 뒤부터는 조작할 수 있어야 한다. 고정이 풀려 스크롤돼 나가는 중에도 조작이 가능해도 된다.
5. **좁은 화면:** 375px에서 음수 margin이 적용되지 않아 구간끼리 겹치지 않아야 한다.

---

### Task 1: 소개가 왼쪽 위로 모이며 사라지고, 데모가 겹쳐 올라오기

**Files:**
- Modify: `src/features/interaction-demos/components/project-title.tsx`
- Modify: `src/features/interaction-demos/components/drag-story.tsx` (등장 ease만)
- Modify: `src/app/(home)/page.tsx`

**Interfaces:**
- `ProjectTitle`의 props는 그대로다.
- 페이지 쪽 약속: `ProjectTitle` 바로 다음 형제 블록에 `relative z-10 lg:motion-safe:-mt-[100vh]`를 준다.

- [ ] **Step 1: `ProjectTitle` 마크업**

- 루트 `frame`에 `relative`를 더한다.
- 머리줄, 이름, 소개 줄을 감싸는 `<div data-group>`을 하나 둔다. 이 div가 모이는 대상이다.

- [ ] **Step 2: `ProjectTitle` 타임라인**

`end: "+=170%"`로 바꾼다. 앞의 70%는 등장과 머묾이고, 뒤의 100%는 데모와 겹치는 구간이다. 위치는 0~1 사이 값이고, 마지막 tween이 1에서 끝나야 한다.

| 위치 | 대상 | 동작 | duration |
|---|---|---|---|
| 0 | `[data-eyebrow] [data-rise]` | `yPercent 100` → 0 | 0.08 |
| 0.04 | `[data-name] [data-rise]` | `yPercent 110` → 0, `ease: "power3.out"` | 0.16 |
| 0.18 | `[data-line]` | `{ y: 40, opacity: 0 }` → `{ y: 0, opacity: 1 }`, `stagger: 0.04` | 0.1 |
| 0.41 | `[data-group]` | → `{ x: () => 32 - group.offsetLeft, y: () => 72 - group.offsetTop, scale: 0.3, transformOrigin: "left top", ease: "power2.inOut" }` | 0.39 |
| 0.62 | `[data-group]` | → `{ opacity: 0 }` | 0.18 |
| 0.8 | 없음 | `.to({}, { duration: 0.2 })` | 0.2 |

- 0.28~0.41은 다 나온 상태로 머무는 구간이다.
- 0.41은 데모 블록의 위쪽이 화면 아래에 닿는 시점(70/170)이다.
- `group`은 `el.querySelector("[data-group]")`로 얻는다. `offsetLeft`와 `offsetTop`은 `relative`인 frame을 기준으로 한 값이다.

- [ ] **Step 3: 데모 블록 겹치기 (`page.tsx`)**

- `#trego-drag` 섹션에 `className="relative z-10 lg:motion-safe:-mt-[100vh]"`를 준다.
- `#surgiauth`에서는 `<SplitReveal …/>`를 `<div className="relative z-10 lg:motion-safe:-mt-[100vh]">`로 감싼다.

- [ ] **Step 4: 드래그 등장을 빠르게 (`drag-story.tsx`)**

등장 타임라인에서 stage tween의 `ease`를 `"power2.out"`에서 `"expo.out"`으로 바꾼다. 다른 값은 그대로 둔다.

- [ ] **Step 5: 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 6: 브라우저 검증 (Review Focus 1, 2, 3, 5)**

- dev 서버는 이미 `http://localhost:3000`에서 돌고 있다. pane이 숨겨져 있으면 값을 읽기 전에 screenshot을 찍는다.
- 1440×900에서 Trego 소개 고정의 진행도 0.3, 0.55, 0.75, 1.0을 캡처한다.
  - 0.3: 소개가 가운데에 있다.
  - 0.55: 소개가 왼쪽 위로 작아지는 중이고, 드래그 무대가 아래에서 올라오는 중이다.
  - 0.75: 소개가 거의 사라졌고 무대가 대부분 올라와 있다.
  - 1.0: 소개의 opacity가 0이고, 무대가 위쪽에 닿아 고정이 시작된다.
- 고정이 끝난 뒤 200px 더 내려도 소개가 다시 보이지 않아야 한다.
- SurgiAuth 소개에서 SplitReveal로 넘어가는 구간도 같은 방식으로 확인한다.
- `.pin-spacer` 위치를 출력해서 Review Focus 3을 확인한다.
- 375×812에서는 구간끼리 겹치지 않는지 본다. 각 섹션의 `getBoundingClientRect().top`이 이전 섹션의 bottom 이상이어야 한다. 끝나면 `resize_window desktop`으로 되돌린다.

- [ ] **Step 7: 커밋**

제목 예: `홈 프로젝트 소개가 왼쪽 위로 모이며 사라지고 데모가 겹쳐 올라오도록 변경`

---

### Task 2: 드래그 퇴장을 자연 스크롤로 바꾸고 단계 간격 고르기

**Files:**
- Modify: `src/features/interaction-demos/components/drag-story.tsx`

- [ ] **Step 1: 퇴장 tween 삭제**

고정 타임라인에서 `.to({}, { duration: 0.88 })`과 0.88 위치의 퇴장 tween 두 개를 지운다. 대신 `.to({}, { duration: 1 })` 하나로 진행도 0~1을 유지한다. 그러면 고정이 풀린 뒤 무대가 그대로 위로 스크롤돼 나간다.

- [ ] **Step 2: 단계 경계와 조작 가능 구간 조정**

- 퇴장 구간이 사라졌으므로 세 단계의 길이를 고르게 맞춘다: `STARTS = [0, 0.34, 0.67]`, `CENTERS = [0.17, 0.5, 0.83]`.
- `ready`는 고정이 시작된 뒤부터 true로 둔다.
  - `onToggle`: `setReady(self.progress > 0 || self.isActive)`
  - `onUpdate`: `setReady(true)`
  - 등장 중(고정 전)에는 `matchMedia` 콜백 첫머리의 `setReady(false)`가 유지된다.
  - 위로 되돌아가 고정 시작점보다 위로 가면 `onToggle`이 `isActive=false`, `progress=0`으로 불려서 false가 된다.
- 상단 주석 「끝에서 위로 밀려난다」는 「고정이 풀리면 그대로 위로 스크롤돼 나간다」로 고친다.

- [ ] **Step 3: 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 4: 브라우저 검증 (Review Focus 4)**

- 1440×900에서 드래그 고정 진행도 0.17, 0.5, 0.83일 때 단계가 각각 V1~V3, V4, V5~V6인지 본다.
- 단계 버튼 세 개를 눌러 각 CENTERS로 이동하는지 본다.
- 고정이 끝난 직후(+200px) 무대가 위로 스크롤돼 나가는 중이고, 화면 아래에서 탐색 구간이 보이는지 본다. 빈 화면이 생기면 안 된다.
- 등장 중에는 무대가 `inert`이고, 고정 중에는 아닌지 본다.

- [ ] **Step 5: 커밋**

제목 예: `홈 드래그 스토리 퇴장을 자연 스크롤로 바꾸고 단계 간격을 고르게 조정`

---

### Task 3: Trego 링크를 Trego 구간 끝으로 이동

**Files:**
- Modify: `src/app/(home)/page.tsx`

- [ ] **Step 1: 링크 이동**

- `#trego-drag` 안의 `<p className="mt-6 text-center"><Link …>Trego에서 한 설계 보기 …</Link></p>`를 지운다.
- 같은 형태의 링크를 `#trego-nav` 섹션 안, `<SplitReveal …/>` 다음에 넣는다. 감싸는 요소는 `<p className="pb-16 pt-6 text-center">`이고, 링크 문구는 「Trego 설계 전체 보기」이다. 아이콘과 클래스는 그대로 쓴다.

- [ ] **Step 2: README 확인**

`README.md`에서 「Trego에서 한 설계 보기」 문구나 링크 위치를 설명하는 부분이 있으면 새 위치와 새 문구에 맞게 고친다. 없으면 고치지 않는다.

- [ ] **Step 3: 전체 검사**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: 모두 통과

- [ ] **Step 4: 브라우저 전체 확인**

- 1440×900에서 처음부터 끝까지 스크롤하며 확인한다. 각 전환에서 빈 화면이 반 화면 이상 이어지는 곳이 없어야 한다.
- 링크는 탐색 데모가 끝난 직후, SurgiAuth 소개 직전에 보여야 한다.
- 콘솔 새 오류가 0이어야 한다. 오래된 로그와 섞여 있으면 `console.clear()` 후 새로고침해서 본다.
- 375×812도 한 번 훑어본다. 끝나면 `resize_window desktop`으로 되돌린다.

- [ ] **Step 5: 커밋**

제목 예: `홈 Trego 설계 링크를 탐색 데모 다음 Trego 구간 끝으로 이동`

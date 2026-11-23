# 드래그 무대 조립 등장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **실행 모델:** Sonnet.

**Goal:** 홈 드래그 스토리가 들어올 때 무대가 한 덩어리로 올라오지 않게 한다. 대신 빈 무대가 자리를 잡고, 그 위에 트리, 지도, 하단 줄이 차례로 들어와 맞물리는 「조립」 장면으로 바꾼다.

**Architecture:**
- `DragStory`(interaction-demos)는 dnd feature를 import할 수 없다. 데모는 `key={current.id}`로 단계마다 다시 마운트되고, `ssr: false` 동적 로딩이라 늦게 나타난다. 그래서 GSAP이 트리와 지도 DOM을 직접 잡지 않는다.
- 대신 CSS 변수를 계약으로 쓴다.
  - dnd 쪽 `DemoFrame`의 트리 열과 지도 열은 `--asm-*` 변수를 읽어 `translate`와 `opacity`에 쓴다. 변수가 없을 때의 기본값은 이동 0, opacity 1이다.
  - `DragStory`는 자기가 소유한 `content` 요소에 이 변수들을 GSAP으로 tween한다.
  - CSS 변수는 상속되므로, 데모가 늦게 로드되거나 다시 마운트돼도 그대로 적용된다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, GSAP 3.15 ScrollTrigger.

**Spec:** 별도 스펙은 없다. 사용자 요청은 「스크롤 업 대신 조립되는 느낌, 트리 영역이랑 지도 영역 나눠서」이다. 참고 장면은 외부 포트폴리오에서 연한 판, 큰 화면, 카드, 폰이 시차를 두고 모여 한 장면이 되는 부분이다. 기법만 가져오고, 목업을 덧붙이지 않는다. 쓰는 요소는 이미 있는 트리와 지도 두 영역뿐이다. 이전 계획서는 `docs/superpowers/plans/2026-11-23-title-handoff-and-gaps.md`이다.

## Global Constraints

- 블러(`filter: blur`)를 쓰지 않는다.
- 연출은 `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`에서만 건다. 그 밖의 환경에서는 `--asm-*`가 설정되지 않으므로 기본값(이동 0, opacity 1)으로 정적으로 보인다.
- `DemoFrame`은 `/dnd` 페이지에서도 쓴다. 변수가 없으면 지금과 완전히 같게 보여야 한다.
- features끼리 import하지 않는다. 두 feature 사이의 연결은 CSS 변수 이름 7개뿐이고, 양쪽 파일에 같은 이름을 주석으로 적는다.
- `DragStory`의 단계 로직(`STARTS`, `CENTERS`, `BACK_MARGIN`, `go()`), 고정 타임라인, `ready`/`inert`, 높이 맞춤 로직은 건드리지 않는다.
- 커밋 메시지는 한국어 제목과 본문 불릿으로 쓰고 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`로 끝낸다.

## Review Focus

1. **`/dnd` 페이지 회귀:** 변수가 없을 때 트리와 지도의 위치와 opacity가 변경 전과 같아야 한다.
2. **늦게 로드되는 데모:** 첫 방문에서 무대가 들어오는 중에 데모 청크가 늦게 도착해도, 트리와 지도가 현재 스크롤 진행도에 맞는 조립 상태로 보여야 한다. 다 조립된 상태로 툭 나타나면 안 된다.
3. **되돌아 스크롤:** V5~V6까지 내려갔다가 위로 올라와 등장 구간에 다시 들어오면, 다시 마운트된 V1~V3 데모도 거꾸로 분해돼야 한다.
4. **높이 맞춤:** `translate`는 높이에 영향을 주지 않는다. 고정 중 `zoom` 값이 변경 전과 같아야 한다.
5. **좁은 화면과 움직임 줄이기:** `content`에 `--asm-*` 인라인 스타일이 남지 않아야 한다.

---

### Task 1: CSS 변수 조립 등장

**Files:**
- Modify: `src/features/dnd/components/demo-frame.tsx`
- Modify: `src/features/interaction-demos/components/drag-story.tsx`
- Modify: `README.md` (`### 홈 드래그 스토리` 절의 「Trego 소개가 제자리에서 사라지는 동안 …」 문장)

**Interfaces (두 feature 사이의 계약):**

| 변수 | 기본값 | 쓰는 곳 |
|---|---|---|
| `--asm-tree-x` | `0px` | 트리 열 `translate` x |
| `--asm-tree-y` | `0px` | 트리 열 `translate` y |
| `--asm-tree-o` | `1` | 트리 열 `opacity` |
| `--asm-map-x` | `0px` | 지도 열 `translate` x |
| `--asm-map-y` | `0px` | 지도 열 `translate` y |
| `--asm-map-o` | `1` | 지도 열 `opacity` |
| `--asm-map-s` | `1` | 지도 열 `scale` |

- [ ] **Step 1: `DemoFrame`에서 변수 읽기**

- 트리 열 div(`w-full max-w-80 shrink-0 space-y-3 max-md:mx-auto`)에 다음 클래스를 더한다.
  - `[translate:var(--asm-tree-x,0px)_var(--asm-tree-y,0px)]`
  - `[opacity:var(--asm-tree-o,1)]`
- 지도 열 div(`w-full max-w-md pt-10 max-md:mx-auto`)에 다음 클래스를 더한다.
  - `[translate:var(--asm-map-x,0px)_var(--asm-map-y,0px)]`
  - `[scale:var(--asm-map-s,1)]`
  - `[opacity:var(--asm-map-o,1)]`
- 컴포넌트 위 주석에 한 줄을 더한다: 「홈 DragStory가 --asm-* 변수로 트리·지도를 따로 조립해 등장시킨다. 변수가 없으면 이동 없음.」

- [ ] **Step 2: `DragStory` 등장 타임라인 교체**

등장 타임라인(`start: "top bottom"`, `end: "top top"`)의 tween을 아래로 바꾼다. 범위, scrub, `invalidateOnRefresh`는 그대로 둔다. 기존 `content` opacity/y tween은 지운다.

| 위치 | 대상 | from → to | duration / ease |
|---|---|---|---|
| 0 | `stage` | 기존 그대로: `{ scale: 0.72, y: 80, clipPath: "…round 48px" }` → `{ scale: 1, y: 0, clipPath: "…round 16px" }` | 1 / `"expo.out"` |
| 0.2 | `content` | `{ "--asm-tree-x": "-160px", "--asm-tree-y": "0px", "--asm-tree-o": 0 }` → `{ "--asm-tree-x": "0px", "--asm-tree-o": 1 }` | 0.45 / `"power3.out"` |
| 0.35 | `content` | `{ "--asm-map-x": "120px", "--asm-map-y": "60px", "--asm-map-s": 0.94, "--asm-map-o": 0 }` → `{ "--asm-map-x": "0px", "--asm-map-y": "0px", "--asm-map-s": 1, "--asm-map-o": 1 }` | 0.45 / `"power3.out"` |
| 0.6 | `footer` | 기존 그대로: `{ opacity: 0, y: 40 }` → `{ opacity: 1, y: 0 }` | 0.3 |

마지막 tween이 0.9에서 끝나고 stage는 1에서 끝나므로 전체 길이는 1이다.

- `content` 위에 계약 변수 이름을 적은 주석 한 줄을 남긴다. 「변수 이름은 dnd DemoFrame과 맞춘다」라는 내용이다.
- `matchMedia`의 `mm.revert()`가 인라인 변수를 지우는지 브라우저에서 확인한다(Review Focus 5). 지우지 않으면 cleanup에서 `gsap.set(content.current, { clearProps: "--asm-tree-x,--asm-tree-y,--asm-tree-o,--asm-map-x,--asm-map-y,--asm-map-s,--asm-map-o" })`를 호출한다.

- [ ] **Step 3: README**

해당 문장을 다음으로 바꾼다.

> Trego 소개가 제자리에서 사라지는 동안 빈 무대가 아래에서 커지며 자리를 잡고, 트리와 지도가 차례로 들어와 맞물려요. 고정이 풀리면 그대로 위로 스크롤돼 나가요.

- [ ] **Step 4: 검사**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: 모두 통과

- [ ] **Step 5: 브라우저 검증**

- dev 서버는 `http://localhost:3000`에서 이미 돌고 있다. `preview_start {url}`로 연다. pane이 숨겨져 있으면 값을 읽기 전에 3초 기다린 뒤 screenshot을 한두 번 찍는다.
- **1440×900, 등장 구간 진행도 0.15, 0.4, 0.6, 1.0 캡처:**
  - 0.15: 빈 무대만 보인다.
  - 0.4: 트리가 왼쪽에서 들어오는 중이다.
  - 0.6: 지도가 오른쪽 아래에서 들어오는 중이다.
  - 1.0: 모두 맞물려 있다.
  - 각 지점에서 `getComputedStyle(content).getPropertyValue("--asm-tree-o")`와 `--asm-map-o` 값을 함께 기록한다.
- **Review Focus 2:** `location.reload()` 직후 바로 등장 구간 중간으로 `scrollTo`해서, 데모가 로드되자마자 중간 조립 상태로 보이는지 본다.
- **Review Focus 3:** 고정 진행도 0.9(V5~V6)까지 갔다가 등장 구간 0.4로 되돌아와 캡처한다. 트리가 다시 왼쪽으로 빠져 있어야 한다.
- **Review Focus 4:** 고정 중 데모의 `style.zoom`을 기록한다.
- **Review Focus 1:** `/dnd` 페이지를 열어 트리와 지도가 평소대로 보이는지 캡처한다.
- **Review Focus 5:** 375×812에서 `content.getAttribute("style")`에 `--asm`이 없는지 본다. 끝나면 `resize_window desktop`으로 되돌린다.
- 콘솔 새 오류가 0이어야 한다. 오래된 로그와 섞여 있으면 `console.clear()` 후 새로고침해서 본다.
- 마지막으로 `npm run build`를 돌린다. 브라우저 검증을 모두 끝낸 뒤에 돌린다.

- [ ] **Step 6: 커밋**

제목 예: `홈 드래그 스토리 등장을 트리·지도가 따로 들어와 맞물리는 조립 방식으로 변경`

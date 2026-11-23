# 프로젝트 소개 장면과 DragStory 등장·퇴장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **실행 모델:** Sonnet.

**Goal:** 홈에서 Trego와 SurgiAuth가 처음 소개될 때 화면을 고정하고, 작은 머리줄 → 아주 큰 프로젝트 이름 → 소개 문장이 마스크 안에서 솟아오르게 한다. 다 나온 뒤에는 그대로 일정 스크롤 동안 고정돼 있다가, 고정이 풀리면 문구가 위로 올라가고 그 아래에서 데모 무대가 커지며 들어온다. 드래그 데모(`DragStory`)는 이 「아래에서 커지며 들어오는」 등장과 「위로 밀려나는」 퇴장으로 바꾼다.

**Architecture:** 새 컴포넌트 `ProjectTitle`이 소개 장면을 맡고 퇴장 애니메이션은 없다. 고정이 풀린 뒤의 자연 스크롤이 퇴장이다. `DragStory`는 등장용 트리거(고정 없음, 프레임이 화면에 들어오는 동안)와 기존 고정 타임라인(단계, 퇴장) 두 개로 나눈다. 단계 로직(`STARTS`·`CENTERS`·`BACK_MARGIN`)과 pin 길이(`+=450%`)는 그대로 둔다. GSAP 사용법은 기존과 같다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, GSAP 3.15 ScrollTrigger.

**Spec:** 별도 스펙은 없다. 참고 장면은 외부 포트폴리오의 「작은 머리줄 + 화면 가운데의 아주 큰 프로젝트 이름」 장면이고, 거기서는 이름이 글자 높이만큼 가려진 틀 안에서 솟아오른다. 기법만 쓰고 문구와 디자인은 가져오지 않는다. 이전 계획은 `docs/superpowers/plans/2026-11-23-home-scroll-motion.md`이다.

## Global Constraints

- 범위는 홈(`/`)의 `page.tsx`, 새 `project-title.tsx`, `drag-story.tsx`, `README.md`뿐이다.
- 새 의존성을 넣지 않는다.
- **블러(`filter: blur`)를 쓰지 않는다.** 사용자가 단어 블러 해제를 「따라 한 느낌」이라고 해서 되돌렸다. 등장은 마스크 안에서 솟아오르기(`yPercent`), 이동, 크기, 불투명도로만 만든다.
- 고정 연출은 `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`에서만 건다. 그 밖에는 고정 없이 최종 상태가 정적으로 보여야 한다. 초기 숨김을 CSS로 미리 걸지 말고 GSAP `fromTo`로만 건다.
- 모든 타임라인은 `scrub: 0.6`, `pin: true`, `invalidateOnRefresh: true`이다.
- 구간 id(`intro`, `trego`, `trego-drag`, `trego-nav`, `surgiauth`, `contact`)는 그대로 둔다.
- 마스크 구조: 바깥 `<span className="block overflow-hidden">` 안에 안쪽 `<span data-rise className="block">`를 둔다. 솟아오르는 것은 안쪽이다. 아래 획이 잘리지 않게 바깥에 `pb-[0.08em]`을 준다.
- 커밋 메시지는 한국어 제목과 본문 불릿으로 쓰고 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`로 끝낸다.

## Review Focus

1. **DragStory의 높이 맞춤(zoom):** `apply()`는 `getBoundingClientRect()`로 잰다. 무대에 `scale`이 걸린 동안(등장·퇴장) 재면 배율이 틀어진다. 그래서 고정 중(`ready`)에만 잰다. (Task 2)
2. **조작 차단:** 무대가 움직이는 동안(등장 전, 퇴장 중)에는 데모가 휠과 드래그를 받지 않아야 한다. 받으면 보이지 않는 데모가 스크롤을 가로챈다. (Task 2)
3. **단계 버튼 이동:** `go(i)`로 V4나 V5~V6을 눌렀을 때, 바뀐 pin 길이에서도 해당 단계 한가운데로 가야 한다. (Task 2)
4. **연속된 pin 사이 시작 위치:** Trego 소개, DragStory, 탐색 SplitReveal, SurgiAuth 소개, SurgiAuth SplitReveal 다섯 개가 연달아 고정된다. 각 장면이 앞 장면의 고정이 끝난 뒤에 시작해야 한다. (Task 1, 2 검증)
5. **좁은 화면:** 375px에서 큰 이름이 가로로 넘치지 않아야 한다(`scrollWidth === innerWidth`). (Task 1)

---

### Task 1: 프로젝트 소개 장면 `ProjectTitle`

**Files:**
- Create: `src/features/interaction-demos/components/project-title.tsx`
- Modify: `src/app/(home)/page.tsx` (`#trego`, `#surgiauth`)
- Modify: `README.md` (홈 「스크롤 연출」 불릿)

**Interfaces:**
- Produces: `export function ProjectTitle({ eyebrow, name, lines }: { eyebrow: string; name: string; lines: readonly string[] }): JSX.Element`

- [ ] **Step 1: 마크업**

루트는 `<div ref={frame} className="flex flex-col items-center justify-center py-24 text-center lg:h-screen lg:py-0">`이다. 안쪽은 위에서부터 이 순서다.
- 머리줄: `<p>`. 마스크 구조를 쓰고, 클래스는 `font-mono text-sm text-muted-foreground sm:text-base`이다. `data-eyebrow`를 단다.
- 이름: `<h2>`. 마스크 구조를 쓰고, 클래스는 `mt-4 text-[clamp(3rem,11vw,9rem)] font-bold leading-[1.05] tracking-[-0.045em]`이다. `data-name`을 단다.
- 소개: `lines.map`으로 줄마다 `<p data-line>`을 만든다. 첫 줄은 `mt-8 text-xl font-medium sm:text-2xl`, 둘째 줄부터는 `mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground`이다. 마스크는 쓰지 않는다.

- [ ] **Step 2: 타임라인** (`end: "+=110%"`, 위치는 0~1 사이 값)

| 위치 | 대상 | from → to | duration |
|---|---|---|---|
| 0 | `[data-eyebrow] [data-rise]` | `yPercent 100` → 0 | 0.15 |
| 0.08 | `[data-name] [data-rise]` | `yPercent 110` → 0, `ease: "power3.out"` | 0.3 |
| 0.35 | `[data-line]` | `{ y: 40, opacity: 0 }` → `{ y: 0, opacity: 1 }`, `stagger: 0.08` | 0.2 |
| 0.55 | 없음 | `.to({}, { duration: 0.45 })`로 다 나온 상태를 유지한다 | 0.45 |

**퇴장 애니메이션은 넣지 않는다.** 고정이 풀리면 문구가 그대로 위로 스크롤돼 올라가고, 그 아래에서 다음 데모가 들어온다(사용자 요청: 「일정 스크롤 동안 고정되어 있다가 올라가면서 아래 데모 나오게」). `data-group`도 쓰지 않으므로 달지 않는다.

- [ ] **Step 3: 홈에 적용**

- `#trego`: 섹션의 클래스를 `space-y-4 pb-8 pt-14 text-center`에서 클래스 없음으로 바꾼다. 안쪽(`ScrollReveal`로 감싼 머리말과 요약 `<p>`)을 `<ProjectTitle eyebrow={`${trego.period} · ${trego.role}`} name={trego.name} lines={[trego.kicker, trego.summary]} />` 하나로 바꾼다.
- `#surgiauth`: `<SplitReveal>` 앞에 `<ProjectTitle eyebrow={`${surgi.period} · ${surgi.role}`} name={surgi.name} lines={[surgi.kicker, surgi.summary]} />`를 넣는다. `SplitReveal`의 `text`에서는 머리줄, `h2`, kicker 묶음(`<div className="space-y-3">…</div>`)을 지우고 `surgiPairs` 목록만 남긴다.
- `page.tsx`에서 쓰이지 않게 된 import와 상수는 lint가 알려 주는 대로 지운다. `ScrollReveal`은 SurgiAuth 수치와 연락처에서 계속 쓴다.

- [ ] **Step 4: README**

홈 「스크롤 연출」 불릿 맨 앞에 다음 문장을 넣는다.

> 프로젝트가 처음 나올 때 화면이 멈추고, 큰 프로젝트 이름과 소개가 차례로 솟아올라요.

- [ ] **Step 5: 검사**

Run: `npm run lint && npx tsc --noEmit`
Expected: 오류 0

- [ ] **Step 6: 브라우저 검증**

`.claude/launch.json`의 `dev`를 띄운다. 이미 3000번에서 돌고 있으면 `preview_start {url: "http://localhost:3000/"}`를 쓴다. pane이 숨겨져 있으면 scrub이 갱신되지 않으므로, 값을 읽기 전에 `computer screenshot`을 한 번 찍는다.
- 1440×900에서 Trego 소개 장면의 진행도 0.05, 0.3, 0.8 지점과 고정이 풀린 직후(pin 끝 + 40vh)를 캡처한다. 순서대로 머리줄, 이름이 솟는 중, 모두 보임(고정), 문구가 위로 올라가고 아래에서 드래그 무대가 커지며 들어오는 중이어야 한다.
- SurgiAuth 소개도 같은 방식으로 확인하고, 소개가 끝난 뒤에 SplitReveal이 시작하는지 본다.
- 375×812에서 고정 없이 큰 이름이 보이고 `document.documentElement.scrollWidth === innerWidth`인지 본다. 끝나면 `resize_window desktop`으로 되돌린다.

- [ ] **Step 7: 커밋**

제목 예: `홈 Trego·SurgiAuth 소개를 큰 이름이 솟아오르는 고정 장면으로 변경`

---

### Task 2: DragStory 등장·퇴장 다시 만들기

**Files:**
- Modify: `src/features/interaction-demos/components/drag-story.tsx`
- Modify: `README.md` (`### 홈 드래그 스토리` 절에 한 문장)

**Interfaces:**
- Consumes: 없음. props(`steps`, `demos`)는 그대로다.
- 바뀌는 값:
  - `CLOSED`·`OPEN` 상수, 무대의 초기 clip-path 클래스(`lg:motion-safe:[clip-path:…]`), `label` div(무대 안의 「드래그 하나를 세 번 다시 만들었습니다 / 내려 보세요」)를 지운다. 바로 앞의 Trego 소개 장면이 제목 역할을 하므로 이 안내가 필요 없다.
  - `end: "+=450%"`, `STARTS`, `CENTERS`, `BACK_MARGIN`은 그대로 둔다.

- [ ] **Step 1: 등장 트리거 (고정 없음)**

`matchMedia` 콜백 안에, 기존 고정 타임라인보다 먼저 만든다.

```ts
gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: { trigger: frame.current, start: "top bottom", end: "top top", scrub: 0.6, invalidateOnRefresh: true },
})
  .fromTo(stage.current, { scale: 0.72, y: 80, clipPath: "inset(0% 0% 0% 0% round 48px)" }, { scale: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1, ease: "power2.out" }, 0)
  .fromTo(content.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35 }, 0.15)
  .fromTo(footer.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 0.3);
```

`footer`는 새 ref로, 하단 설명·버튼 줄 div에 단다. 이렇게 하면 소개 문구가 위로 올라가는 동안 무대가 아래에서 커지며 들어오고, 프레임 위쪽이 화면 위쪽에 닿는 순간 다 펴진 상태로 고정이 시작된다.

- [ ] **Step 2: 고정 타임라인 (단계와 퇴장)**

기존 고정 타임라인에서 clip-path, label, content 등장 tween을 지우고 퇴장만 남긴다. defaults는 `ease: "none"`이고, 마지막 tween이 1에서 끝나야 한다.

| 위치 | 대상 | 동작 | duration |
|---|---|---|---|
| 0 | 없음 | `.to({}, { duration: 0.88 })`. 단계 구간이다 | 0.88 |
| 0.88 | `content`, `footer` | → `{ opacity: 0, y: -12 }` | 0.04 |
| 0.88 | `stage` | → `{ y: "-12vh", scale: 0.88, opacity: 0 }`, `ease: "power2.in"` | 0.12 |

- [ ] **Step 3: 조작 차단과 높이 맞춤**

- `SplitReveal`처럼 `const [ready, setReady] = useState(true)`를 둔다.
- `matchMedia` 콜백 안에서는 `setReady(false)`로 시작한다.
- 고정 트리거의 `onToggle: (self) => setReady(self.isActive && self.progress < 0.88)`을 추가하고, 기존 `onUpdate`에도 `setReady(p < 0.88)`을 더한다. 등장 중(고정 전)과 퇴장 중에는 조작을 받지 않는다.
- 콜백의 cleanup에서 `setReady(true)`로 되돌린다.
- 무대 div에 `inert={!ready}`를 준다.
- 높이 맞춤 effect의 의존성에 `ready`를 더하고, `apply()` 첫 줄에 `if (!ready) return;`을 넣는다(Review Focus 1). 무대에 scale이 걸린 동안 재면 배율이 틀어진다는 이유를 주석 한 줄로 남긴다.

- [ ] **Step 4: README**

`### 홈 드래그 스토리` 절 끝에 다음 문장을 넣는다.

> Trego 소개가 위로 올라가는 동안 무대가 아래에서 커지며 들어오고, 마지막에는 위로 밀려나며 다음 구간에 자리를 넘겨요.

기존 README에 「작은 카드가 커지는」 식의 설명이 있으면 이 문장과 맞게 고친다.

- [ ] **Step 5: 검사**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: 모두 통과

- [ ] **Step 6: 브라우저 검증**

- 1440×900에서 등장 중(프레임 top이 화면 50%), 고정 시작 직후, V4(진행도 0.5), V5~V6(0.75), 퇴장 중(0.95)을 캡처한다.
- 등장 중과 0.95에서는 무대가 `inert`이고, 고정 중에는 아닌지 본다.
- 고정 중 데모의 `style.zoom`이 1이거나 0.8 이상인지 본다.
- 단계 버튼 V4와 V5~V6을 눌러 각 단계 가운데로 이동하는지 본다(Review Focus 3).
- 1440×700에서 데모가 잘리지 않는지 본다.
- 375×812에서는 고정 없이 카드만 보이는지 본다.
- 콘솔 오류가 0인지 본다. 끝나면 `resize_window desktop`으로 되돌린다.

- [ ] **Step 7: 커밋**

제목 예: `홈 드래그 스토리를 아래에서 커지며 들어오고 위로 밀려나는 등장·퇴장으로 변경`

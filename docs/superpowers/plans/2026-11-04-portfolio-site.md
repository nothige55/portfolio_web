# 포트폴리오 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈, `/dnd`, `/about` 세 페이지와 공통 헤더/푸터를 만든다. DnD 체험 자리는 빈 박스로 둔다.

**Architecture:** `src/app`의 페이지가 `features/dnd`(챕터 데이터와 컴포넌트)와 `features/profile`(소개 섹션)을 조합한다. 공통 골격은 `components/layouts`, 사이트 상수는 `config/site.ts`. 페이지는 전부 서버 컴포넌트이고 상태가 없다.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind v4, shadcn/ui, `next/font/google`(Noto Serif KR), `@fontsource-variable/pretendard`.

**Spec:** `docs/superpowers/specs/2026-11-04-portfolio-site-plan-design.md`

## Global Constraints

- 한국어만. `<html lang="ko">`.
- 읽는 폭 약 680px(`max-w-[680px]`), 체험 자리만 약 1100px(`max-w-[1100px]`).
- 제목은 세리프(Noto Serif KR), 본문은 Pretendard. 무채색 + 포인트 색 하나(파랑). 다크 모드는 `prefers-color-scheme`을 따른다.
- UI 골조는 shadcn 우선(`npx shadcn@latest add <name>`). 직접 만든 UI 파일은 kebab-case 파일명.
- bulletproof 경계: features끼리 import 금지, 공용 레이어는 features/app import 금지. `npm run lint`가 강제한다.
- 폴더에 실제 파일을 넣으면 그 폴더의 한 줄짜리 `README.md`를 지운다.
- 백엔드, 다국어, 블로그, 프로젝트 목록은 만들지 않는다.
- 자리표시 문구는 담백한 해요체. 이름, 한 줄 소개, 이메일은 `src/config/site.ts` 한 곳에서만 정의한다.
- 커밋 메시지는 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`로 끝낸다.

## Review Focus

1. `/`의 티저 카드가 `/dnd#chapter-a|b|c`로 가는데, `/dnd`에 같은 id가 없으면 링크가 조용히 깨진다. (Task 4)
2. 375px 폭에서 가로 스크롤이 생기면 안 된다. 특히 1100px 체험 자리와 커밋 해시 나열. (Task 3, 4)
3. 다크 모드에서 본문, 카드, 포인트 색의 대비가 무너지면 안 된다. 시스템 설정만 따른다. (Task 1)
4. `site.email`이 비어 있을 때 `mailto:` 빈 링크가 렌더되면 안 된다. 비어 있으면 이메일 링크를 숨긴다. (Task 2, 4)
5. 키보드만으로 헤더 링크와 본문에 도달할 수 있어야 한다. 본문 바로가기 링크와 보이는 포커스 링이 필요하다. (Task 2)

검증 방식: 화면 중심 사이트라 단위 테스트 프레임워크는 도입하지 않는다. 각 태스크는 `npm run lint`, `npm run build`, 렌더된 HTML에 대한 `grep`으로 확인한다. HTML 확인은 `npm run build && npx next start -p 3100 &` 후 `curl -s localhost:3100/<path>`로 한다.

## File Structure

| 파일 | 책임 |
|---|---|
| `src/config/site.ts` | 이름, 한 줄 소개, 이메일, GitHub, 설명 상수 |
| `src/app/layout.tsx` | 폰트, 메타데이터, 헤더/푸터 장착, 본문 바로가기 |
| `src/app/globals.css` | 색 토큰(포인트 파랑), 다크 모드, 폰트 변수 |
| `src/components/layouts/site-header.tsx` | 홈/DnD/소개 내비게이션 |
| `src/components/layouts/site-footer.tsx` | 이메일, GitHub |
| `src/features/dnd/config/chapters.ts` | 챕터 A/B/C 데이터 |
| `src/features/dnd/components/chapter-section.tsx` | 챕터 한 덩어리 레이아웃 |
| `src/features/dnd/components/demo-slot.tsx` | 비어 있는 체험 자리 |
| `src/features/dnd/components/chapter-teaser.tsx` | 홈의 티저 카드 |
| `src/features/profile/components/intro.tsx` | 홈 한 줄 소개 |
| `src/features/profile/components/about-sections.tsx` | 관심사, 이력, 스택 자리표시 |
| `src/app/page.tsx`, `src/app/dnd/page.tsx`, `src/app/about/page.tsx` | 페이지 조합 |

---

### Task 1: 기반 (폰트, 색 토큰, 사이트 상수, shadcn 컴포넌트)

**Files:**
- Create: `src/config/site.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Delete: `src/config/README.md`

**Interfaces:**
- Produces: `export const site: { name: string; tagline: string; description: string; email: string; github: string }` in `src/config/site.ts`. 값은 자리표시: `name: "이름"`, `tagline: "인터랙션을 만드는 프론트엔드 개발자예요."`, `email: ""`, `github: "https://github.com/nothige55"`, `description`은 tagline과 같은 뜻의 한 문장. 파일 맨 위에 `// 이름, 한 줄 소개, 이메일은 여기서만 바꾼다.` 주석.
- Produces: Tailwind 토큰 `font-serif`(제목), `font-sans`(본문), shadcn `primary`(포인트 파랑).

- [ ] **Step 1: shadcn 컴포넌트와 폰트 패키지 설치**

Run: `npx shadcn@latest add card badge separator && npm install @fontsource-variable/pretendard`
Expected: `src/components/ui/{card,badge,separator}.tsx` 생성. `tabs`는 버전 전환 UI를 만들 때 추가하므로 지금은 설치하지 않는다(YAGNI, 스펙 목록에서 의도적으로 뺌).

- [ ] **Step 2: `src/config/site.ts` 작성** (위 Interfaces의 값 그대로). 같은 태스크에서 `src/config/README.md` 삭제.

- [ ] **Step 3: `globals.css` 수정**

  - `@custom-variant dark (&:is(.dark *));`를 `@custom-variant dark (@media (prefers-color-scheme: dark));`로 바꾼다.
  - 기존 `.dark { ... }` 블록을 `@media (prefers-color-scheme: dark) { :root { ... } }`로 감싸 시스템 설정을 따르게 한다(내용은 유지).
  - `--primary`를 라이트 `oklch(0.55 0.2 260)`, 다크 `oklch(0.72 0.15 255)`로, `--primary-foreground`는 각각 흰색 계열/어두운 계열로 바꾼다.
  - `@theme inline`의 `--font-sans`를 `"Pretendard Variable", system-ui, sans-serif`로, `--font-heading`을 `var(--font-serif)`로 바꾸고 `--font-serif: var(--font-serif)`를 추가한다.

- [ ] **Step 4: `layout.tsx` 수정**

  `Geist`/`Geist_Mono` import와 변수를 지우고 `Noto_Serif_KR({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-serif" })`를 쓴다. `import "@fontsource-variable/pretendard";`를 추가한다. `<html lang="ko">`, `metadata`는 `site.name`과 `site.description`으로 채운다. `title`은 `{ default: site.name, template: \`%s · ${site.name}\` }`.

- [ ] **Step 5: 확인**

Run: `npm run lint && npm run build`
Expected: 둘 다 에러 없이 통과. 홈이 기본 템플릿 그대로 보여도 괜찮다(Task 4에서 교체).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Add fonts, theme tokens, site config, shadcn card/badge/separator

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 공통 레이아웃 (헤더, 푸터, 바로가기)

**Files:**
- Create: `src/components/layouts/site-header.tsx`, `src/components/layouts/site-footer.tsx`
- Modify: `src/app/layout.tsx`
- Delete: `src/components/layouts/README.md`

**Interfaces:**
- Consumes: `site` from `@/config/site`.
- Produces: `export function SiteHeader(): JSX.Element`, `export function SiteFooter(): JSX.Element`. 서버 컴포넌트, props 없음.

- [ ] **Step 1: `SiteHeader` 구현**

  `next/link`로 `홈(/)`, `DnD(/dnd)`, `소개(/about)` 링크. 왼쪽에 `site.name`(홈 링크). 현재 경로 강조는 하지 않는다(클라이언트 훅이 필요해져서 YAGNI). 링크에 보이는 포커스 링(`focus-visible:ring-2 ring-ring`).

- [ ] **Step 2: `SiteFooter` 구현**

  `site.github` 링크는 항상 표시. `site.email`이 truthy일 때만 `mailto:${site.email}` 링크를 렌더한다(Review Focus 4).

- [ ] **Step 3: `layout.tsx`에 장착**

  `<body>` 안 맨 앞에 `<a href="#main" className="sr-only focus:not-sr-only ...">본문으로 건너뛰기</a>`, 그다음 `<SiteHeader />`, `<main id="main" className="flex-1">{children}</main>`, `<SiteFooter />`. 같은 태스크에서 `components/layouts/README.md` 삭제.

- [ ] **Step 4: 확인**

Run: `npm run lint && npm run build && (npx next start -p 3100 & sleep 3; curl -s localhost:3100/ | grep -c 'href="#main"'; curl -s localhost:3100/ | grep -c 'mailto:'; kill %1)`
Expected: lint/build 통과, `href="#main"` 1 이상, `mailto:`는 0(email이 빈 문자열).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add site header, footer and skip link

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: DnD 챕터 데이터와 컴포넌트

**Files:**
- Create: `src/features/dnd/config/chapters.ts`, `src/features/dnd/components/chapter-section.tsx`, `src/features/dnd/components/demo-slot.tsx`, `src/features/dnd/components/chapter-teaser.tsx`

**Interfaces:**
- Produces in `chapters.ts`:
  `export type Chapter = { id: "a" | "b" | "c"; versions: string; title: string; feel: string; reason: string; commits: readonly string[] }` and `export const chapters: readonly Chapter[]` (순서 A, B, C).
  내용은 Trego 채팅에서 정리한 초안이다(사용자가 나중에 고친다):
  - A `V1~V3` "어디에 놓이는지 알려준다": 선과 박스가 놓일 곳을 가리키고 마우스 위치(세로 구역, 가로 깊이)가 의미를 갖는다 / 놓아 보기 전에는 결과를 알 수 없는 불안을 줄이려 삽입선을 두고, 구역과 깊이 선택으로 넓혔다 / `d5f14ff 026742d d9c8c26 2d0d773 44e0352 8970c3a`.
  - B `V4` "붙는다": 놓을 수 있는 자리에 반투명 미리보기가 붙고 형제 항목이 벌어져 자리를 연다, 놓을 수 없는 곳에서는 사라진다 / 선으로 가리키는 대신 결과를 미리 앉혀 보여 주면 예측할 일이 줄어든다 / `282426a aa76544 ca68b49`.
  - C `V5~V6` "앱 전체가 반응한다": 드래그하는 동안 지도, 검색창, 펼침 상태가 함께 움직이고 놓은 뒤의 경로 정보까지 미리 보인다 / 드래그는 목록만의 일이 아니라 앱 전체의 맥락이라서 기다림과 실수 방지(빈 컨테이너 채움 후 허용)까지 설계 대상으로 넓혔다 / `ca8490e 19b1f85 aade967 14e5da0 cfd103e 913bd37 6a11113 be7259f 86fa2d6`.
- Produces: `ChapterSection({ chapter }: { chapter: Chapter })`, `DemoSlot({ versions }: { versions: string })`, `ChapterTeaser({ chapter }: { chapter: Chapter })`. 모두 서버 컴포넌트.

- [ ] **Step 1: `chapters.ts` 작성** (위 데이터 그대로, 문장은 해요체가 아닌 서술체로 둬도 된다).

- [ ] **Step 2: `DemoSlot` 구현**

  `max-w-[1100px]`, 점선 테두리 박스, "준비 중이에요. 이 자리에 {versions} 체험이 들어와요." 문구. 아래에 작은 글씨로 "마우스로 체험하는 데모예요. 데스크톱에서 보세요." 안내. 내부 텍스트가 375px에서 줄바꿈되고 가로로 넘치지 않도록 `break-words`.

- [ ] **Step 3: `ChapterSection` 구현**

  `<section id={\`chapter-${chapter.id}\`}>`(Review Focus 1: 이 id 형식이 티저 링크와 정확히 일치해야 한다). `Badge`로 `versions`, 세리프 `h2`로 `title`, `DemoSlot`, "느낀 것"과 "바뀐 이유" 문단, 커밋은 `<code>`로 해시만 나열(`flex flex-wrap gap-2`로 375px 넘침 방지). 커밋 링크 주소는 Trego 리포 공개 여부가 확정되지 않아 링크 없이 해시만 보인다.

- [ ] **Step 4: `ChapterTeaser` 구현**

  `Card` 안에 `versions` 배지, `title`, `feel` 한 줄. 카드 전체가 `next/link` `href={\`/dnd#chapter-${chapter.id}\`}`.

- [ ] **Step 5: 확인**

Run: `npm run lint && npm run build`
Expected: 통과. (페이지에 아직 연결하지 않아 렌더 확인은 Task 4에서 한다.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Add DnD chapter data and chapter components

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 페이지 조합 (홈, /dnd, /about) 과 마무리

**Files:**
- Create: `src/features/profile/components/intro.tsx`, `src/features/profile/components/about-sections.tsx`, `src/app/dnd/page.tsx`, `src/app/about/page.tsx`
- Modify: `src/app/page.tsx`, `README.md`
- Delete: `src/features/profile/components/README.md`, `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

**Interfaces:**
- Consumes: `chapters`, `ChapterSection`, `ChapterTeaser` (Task 3), `site` (Task 1), `SiteHeader/Footer`는 layout이 이미 처리.
- Produces: `Intro()`: `site.tagline`을 세리프 대제목으로, `site.name`을 위에 작게. `AboutSections()`: "관심사", "이력", "스택" 세 섹션, 각각 자리표시 문단 한 줄과 "내용은 곧 채워 둘게요." 형태의 문구, 아래에 연락처(GitHub 항상, 이메일은 truthy일 때만).

- [ ] **Step 1: 홈 `page.tsx`**

  `Intro` + "드래그 하나를 세 번 다시 만들었어요" 소제목 + `chapters.map` → `ChapterTeaser` 그리드(모바일 1열, `md`부터 3열) + `/about` 링크 버튼(`Button` asChild 대신 `next/link` 스타일 버튼).

- [ ] **Step 2: `/dnd/page.tsx`**

  `export const metadata = { title: "DnD" }`. 상단에 과제 정의: "8/14의 동문시장을 8/12의 공항과 이호테우 사이로 옮기기"를 모든 버전이 같은 과제로 푼다는 한 문단. 이어서 `chapters.map` → `ChapterSection`, 사이에 `Separator`.

- [ ] **Step 3: `/about/page.tsx`**

  `metadata = { title: "소개" }`, `AboutSections` 렌더.

- [ ] **Step 4: 정리**

  `features/profile/components/README.md`와 기본 템플릿 `public/*.svg` 5개 삭제. `README.md`를 프로젝트 소개 3줄(무엇, 실행 명령, 배포 예정)로 교체.

- [ ] **Step 5: 확인**

Run: `npm run lint && npm run build && (npx next start -p 3100 & sleep 3; for id in a b c; do curl -s localhost:3100/dnd | grep -c "id=\"chapter-$id\""; curl -s localhost:3100/ | grep -c "/dnd#chapter-$id"; done; curl -s -o /dev/null -w '%{http_code}\n' localhost:3100/about; kill %1)`
Expected: id 개수와 티저 링크 개수가 a, b, c 모두 1 이상, `/about`은 200.

- [ ] **Step 6: 브라우저 확인 (375px, 데스크톱, 다크)**

  `npm run dev`를 띄우고 세 페이지를 375px 폭으로 열어 가로 스크롤이 없는지(`document.documentElement.scrollWidth <= innerWidth`), 다크 모드 에뮬레이션에서 글자와 카드가 읽히는지, Tab 키로 바로가기 링크가 첫 포커스를 받는지 확인한다.
  Expected: 가로 넘침 없음, 다크 대비 정상, 첫 Tab이 "본문으로 건너뛰기".

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Add home, DnD case study and about pages

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Vercel 배포 (사용자 참여 필요)

**Files:** 없음 (Vercel 대시보드 작업)

- [ ] **Step 1: 사용자가 Vercel에서 `nothige55/portfolio_web` 리포를 import한다.** 프레임워크 자동 감지(Next.js), 환경변수 없음. 이 단계는 계정 로그인이 필요해서 사용자가 직접 한다.
- [ ] **Step 2: 배포된 주소에서 세 페이지가 열리는지 확인한다.**
  Expected: `/`, `/dnd`, `/about` 모두 200.
- [ ] **Step 3: 푸시** (`git push origin main`)는 사용자에게 확인받고 한 뒤 Vercel 자동 배포를 확인한다.

## Self-Review 메모

- 스펙 커버: 3페이지, 헤더/푸터, 빈 체험 자리와 모바일 안내, 시각 방향, 코드 배치, 제작 순서, 배포를 모두 태스크에 매핑했다. 스펙의 `tabs`는 쓰이는 곳이 없어 의도적으로 보류했다.
- 타입 일관성: `Chapter`, `chapters`, `ChapterSection`, `DemoSlot`, `ChapterTeaser`, `site`, `SiteHeader`, `SiteFooter`, `Intro`, `AboutSections` 이름이 태스크 간에 같다. 챕터 앵커는 `chapter-${id}` 하나로 통일했다.

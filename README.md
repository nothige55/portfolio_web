# portfolio_web

신진하(프론트엔드)의 인터랙션 중심 포트폴리오 웹사이트예요. 글로 설명하는 대신 **직접 만져 보게** 만드는 것이 목표예요. 중심 소재는 Trego에서 세 번 다시 만든 드래그예요.

- 라이브 사이트: 배포 예정 (Vercel)
- GitHub: https://github.com/nothige55/portfolio_web

## 직접 만져볼 것

### 홈 — `/`

- 타이핑 제목: 첫 화면 제목의 단어(움직이는지·반응하는지·이어지는지)가 자음·모음 단위로 쳐지고 지워지길 반복해요.
- 드래그 스토리: 드래그 세 단계 데모(a/b/c)를 스크롤하며 그대로 체험할 수 있어요.
- Breadcrumb 데모: Trego 원본 breadcrumb 로직을 이식했어요. 스크롤 기준 행 판정, 조상 경로, 구간 끝 경계 라벨만 가져왔고, breadcrumb은 자리를 차지하지 않고 행 위에 겹쳐 떠요.
- SurgiAuth 수집 격자: roll·pitch 두 축 5×3 칸에 손 각도 샘플이 채워지는 과정을 보여 줘요.
- 스크롤 연출: 프로젝트가 처음 나올 때 화면이 멈추고, 큰 프로젝트 이름과 소개가 차례로 솟아올라요. 연락처는 회색 무대가 화면 폭으로 펴지면서 나와요. 움직임 줄이기 설정에서는 모두 꺼져요.

### 홈 드래그 스토리 — 드래그 하나를 세 번 다시 만들었어요

모든 버전이 같은 과제를 풀어요. **8/14의 동문시장을 8/12의 공항과 이호테우 사이로 옮기는 일**이에요. 같은 동작인데 사용자가 느끼는 것이 어떻게 달라졌는지 비교해 보세요.

| 챕터 | 버전 | 제목 | 만져보면 |
| --- | --- | --- | --- |
| a | V1~V3 | 어디에 놓이는지 알려준다 | 삽입선과 구역 표시가 놓일 곳을 가리켜요. 마우스를 어디에 두느냐(세로 구역, 가로 깊이)가 의미를 가져요. |
| b | V4 | 붙는다 | 놓을 수 있는 자리에 반투명 미리보기가 붙고, 형제 항목이 벌어져 자리를 열어요. 놓을 수 없는 곳에서는 미리보기가 사라져요. |
| c | V5~V6 | 앱 전체가 반응한다 | 드래그하는 동안 지도, 펼침 상태가 함께 움직이고 놓을 자리를 미리 보여 줘요. 자동 펼침 직후에는 7.5px 더 움직이기 전까지 드롭 판정을 미뤄요. |

챕터 c의 지도 연동은 이렇게 동작해요.

- 드래그 중 놓일 자리를 지도에 알려, 잡은 장소를 그 자리에 끼운 미리보기 트리를 그리고 카메라를 해당 컨테이너에 맞춰요. (Trego 원본의 `requestMapMove` / `fitBounds` 동작)
- 리스트가 놓을 자리를 보여 줄 때만 지도에 알려요. 빈 폴더나 접힌 폴더에서 대기 중일 때는 알리지 않아요.
- 놓을 자리가 없을 때는 원래 자리의 점선 빈 자리 표시를 숨겨요.
- 지도 좌표는 데모용이에요.

> 검색창 연동은 챕터 c의 후속 작업이에요. 지금 데모에는 펼침 상태와 지도 연동이 있고, 검색창 연동은 아직 없어요.

Trego 소개가 제자리에서 사라지고 나면, 화면이 고정된 채 그 자리에서 무대가 펼쳐지고 트리와 지도가 차례로 들어와 맞물려요. 고정이 풀리면 그대로 위로 스크롤돼 나가요.

### `/trego` — Trego에서 한 설계

Trego에서 한 일을 글로 정리한 페이지예요. 드래그는 단계별 「구현 / 한계」로, 탐색·상태·실시간 협업은 「문제 / 대안 / 설계 / 과정 / 한계」로 적었어요. 데모는 홈에 있고, 오른쪽 목차(1280px 이상)로 절 사이를 이동해요. 위쪽 경로 바는 스크롤하면 지금 어느 구간인지 따라오고, 현재 위치는 빼고 상위 위치만 보여 줘요.

### `/about`

소개 페이지예요. (관심사·이력·스택은 채우는 중이에요.)

## 담긴 프로젝트

### Trego — 실시간 협업 여행 일정 에디터

- 2025.05 ~ 2026.02, 4인 팀에서 프론트엔드 설계·구현을 주도했어요.
- 여행 일정을 폴더 → 날짜 → 일정 트리로 다루고, 친구와 같은 일정을 동시에 편집하는 웹 에디터예요.
- 이 사이트의 홈 드래그 데모와 breadcrumb, 지도 연동은 Trego 원본 코드를 이식한 거예요.
- 프론트 위주로 다시 정리한 공개 리포: https://github.com/nothige55/trego-web-portfolio

### SurgiAuth — 수술실 비접촉 제스처 인증

- 2026.04 ~ 현재, 4인 팀 졸업작품에서 프론트엔드(손 추적·인증 화면)를 맡고 있어요.
- 장갑을 낀 손으로 화면을 만질 수 없는 수술실에서, 카메라로 손 동작을 읽어 인증해요.
- 홈에는 샘플 수집 격자 데모만 있어요. 팀 졸작이라 코드 공개 방식이 정해지면 링크와 상세를 추가할 예정이에요.

## 기술 스택

| 분야 | 사용 |
| --- | --- |
| 프레임워크 | Next.js 16.4.5 (App Router), React 19.3.0 |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4, shadcn/ui, Base UI, Pretendard, lucide-react |
| 상태 | Zustand 5 |
| 드래그 | dnd-kit (core 6, sortable 10) |
| 모션 | GSAP 3.15 |
| 지도 | Mapbox GL 3.27 |
| 런타임 | Node.js >= 22.18 |

## 실행 방법

```bash
npm install
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버
npm run lint    # ESLint
npm test        # node:test (src/**/*.test.mjs)
```

### Mapbox 토큰

지도는 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` 환경변수로 받아요.

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.… npm run dev
```

토큰이 없으면 Mapbox 지도 대신 기존 SVG 지도를 그대로 써요. 토큰은 `src/config/env.ts`에서만 읽어요.

## 구조와 설계 노트

```
src/app/(home)/page.tsx          # 홈 (/)
src/app/(site)/about/page.tsx    # /about
src/app/(site)/trego/page.tsx    # /trego — Trego 경험 글과 목차
src/config/
  content.ts                     # 홈·/trego에 쓰는 프로젝트 소개와 본문 문구
  site.ts                        # 이름, 한 줄 소개, 연락처
  env.ts                         # 환경변수 (Mapbox 토큰)
src/features/dnd/
  config/chapters.ts             # /trego 드래그 단계별 구현·한계
  stage-a/ stage-b/ stage-c/     # 세 단계 데모
  v3/ v4/ v5/ v6/                # 버전별 구현
  breadcrumb/ map/               # breadcrumb, 지도 연동
  shared/ data/ components/      # 공용 행 치수, 데모 시드, 공용 컴포넌트
src/features/profile/            # /about 소개
src/features/interaction-demos/  # 홈용 데모 (드래그 스토리, SurgiAuth 격자 등)
src/features/variant-story/      # 상단 경로 바, 홈 타이핑 제목·스크롤 유도, /trego 목차
src/hooks/use-active-section.ts  # 경로 바와 목차가 같이 쓰는 현재 구간 판정
```

신경 쓴 점은 커밋 메시지와 코드 주석에 남겨 두는 것을 원칙으로 해요.

- **Trego 코드 재사용:** 홈 드래그 데모의 V1~V3, V4, V5~V6, breadcrumb, Mapbox 지도는 Trego 원본(또는 trego-web-portfolio)에서 이식했어요. 원본과 달라진 곳은 코드에 `"수정:"` 주석으로 표시했어요. 기획이 아닌 구현 한계만 고쳤어요.
- **같은 치수, 같은 판정:** 세 데모의 행 높이 30px, 계층당 들여쓰기 30px, 펼침 칸 20px을 `shared/row-metrics`에 모아 같은 값을 읽어요. 30px은 원본 Trego 행 높이와 같아요.
- **폴백을 기본으로:** 지도 토큰이 없어도 SVG 지도로 체험이 끊기지 않게 했어요. 빈·접힌 폴더처럼 “놓을 수 없는 상태”는 알림을 보내지 않고 조용히 처리해요.
- **테스트:** 드롭 규칙(`calcNewPosition`), 드래그 미리보기 데이터, breadcrumb의 조상 경로·경계 라벨 규칙, 지도 모델, SurgiAuth 손 각도 판정을 `node:test`로 확인해요.

## 앞으로 넣을 것

- [ ] `/trego` 본문의 `확인 필요` 항목 채우기 — 팀 인원, 재귀 렌더링을 버린 이유(`src/config/content.ts`)
- [ ] 챕터 c의 검색창 연동
- [ ] Vercel 배포 후 라이브 URL 연결
- [ ] SurgiAuth 공개 방식 결정 후 링크·상세 추가
- [ ] `/about` 내용 채우기

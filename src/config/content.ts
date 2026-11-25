// 시안 세 개가 같이 쓰는 소개 내용. 출처는 이력서(trego_docs)이고, 수치는 공개 전에 다시 확인한다.
export const projects = [
  {
    id: "trego",
    name: "Trego",
    kicker: "실시간 협업 여행 일정 에디터",
    period: "2025.05 – 2026.02",
    role: "4인 · 프론트엔드 설계·구현 주도",
    // 홈 표지에 쓰는 이 프로젝트의 스택. 근거: dnd 데모가 옮겨 온 원본 코드(dnd-kit, zustand store, mapbox 지도)
    stack: ["React", "TypeScript", "dnd-kit", "Zustand", "Mapbox GL"],
    summary:
      "여행 일정을 폴더 → 날짜 → 일정 트리로 다루고, 친구와 같은 일정을 동시에 편집하는 웹 에디터입니다.",
    points: [
      {
        title: "스크롤 중에도 위치를 잃지 않는 탐색",
        body: "깊은 트리에서 지금 보는 장소가 어느 날짜인지 놓치는 문제를 사용하면서 발견했습니다. 고정 헤더 대신, 원래 라벨이 사라지는 순간에만 조상 경로가 표시되게 했습니다.",
      },
      {
        title: "계층 트리 드래그 앤 드롭",
        body: "삽입선에서 드롭 위치 미리보기로, 다시 앱 전체가 반응하는 방식으로 바꿨습니다. 자동 펼침 직후에는 7.5px 이상 움직여야 드롭 판정을 다시 합니다.",
      },
      {
        title: "계층 트리 상태 설계",
        body: "조회·렌더링·순서 변경이 서로 다른 접근 방식을 요구해서, 원본 배열 하나에서 인덱스 세 개를 파생했습니다. 순서를 바꿀 때는 이웃 사이 중간값을 위치로 써서 다른 행을 수정하지 않습니다.",
      },
      {
        title: "실시간 동시 편집",
        body: "변경을 로컬에 먼저 반영하고, 같은 서버 이벤트가 다시 와도 결과가 같게 만들어 로컬과 서버 상태가 어긋나지 않게 했습니다. 연결 하나로 트리·채팅·커서를 함께 쓰고, 되돌리기는 화면 스냅샷이 아니라 작업 단위 명령 이력이라 다른 사용자의 변경은 되돌리지 않습니다.",
      },
    ],
  },
  {
    id: "surgiauth",
    name: "SurgiAuth",
    kicker: "수술실 비접촉 제스처 인증",
    period: "2026.04 – 현재",
    role: "4인 · 프론트엔드(손 추적·인증 화면)",
    stack: ["MediaPipe", "Electron"],
    summary:
      "장갑을 낀 손으로 화면을 만질 수 없는 수술실에서, 카메라로 손 동작을 읽어 인증하는 졸업작품입니다.",
    points: [
      {
        title: "열기 → 쥐기 → 열기",
        body: "한 번의 동작이 아니라 동작의 순서로 인증해서 우연한 동작을 걸러냅니다.",
      },
      {
        title: "MediaPipe 손 추적",
        body: "브라우저에서 GPU를 우선 사용해 손 추적을 실행합니다.",
      },
      {
        title: "Electron 단말 앱",
        body: "수술실 단말에서 실행되는 데스크톱 앱으로 패키징했습니다.",
      },
    ],
  },
] as const;

export const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "Zustand",
  "Vite",
  "Tailwind CSS",
  "dnd-kit",
  "MediaPipe",
  "Electron",
] as const;

export const education = "동양미래대학교 컴퓨터정보공학과 · 2027.02 졸업 예정";

export type Note = { value: string; label: string };

export const surgiNotes: readonly Note[] = [
  {
    value: "±54° · ±30°",
    label: "roll과 pitch의 인식 한계입니다. 넘으면 수집하지 않습니다.",
  },
  { value: "5 × 3", label: "roll 10°, pitch 18° 간격으로 나눈 칸입니다." },
  { value: "2장", label: "칸마다 채우는 수입니다. 합계 30장입니다." },
];

// /trego 상태 설계 절 수치. 근거: stage-c/utils/build-planner-tree.ts, stage-c/dnd/planner-drop-rules.ts
export const stateNotes: readonly Note[] = [
  {
    value: "3개",
    label:
      "원본 배열 하나에서 entityMap, childrenMap, flattenedItems를 파생합니다.",
  },
  {
    value: "(앞 + 뒤) ÷ 2",
    label:
      "두 이웃 사이에 놓으면 중간값을 position으로 써서 다른 행을 수정하지 않습니다.",
  },
  {
    value: "0.1",
    label: "이웃이 한쪽뿐이거나 없을 때 쓰는 간격(POSITION_STEP)입니다.",
  },
];

// /trego 실시간 협업 절의 본 앱 근거 링크. 이 저장소에는 데모가 없고 trego-web-portfolio에 있다.
export const syncLinks = [
  {
    label: "백엔드 없이 동작하는 /demo",
    href: "https://trego-web-portfolio.vercel.app/demo",
  },
  {
    label: "코드 보기",
    href: "https://github.com/nothige55/trego-web-portfolio",
  },
] as const;

// /trego 본문 초안. 근거: trego_docs(인터랙션-breadcrumb, architecture-decisions, 어필포인트-출처대조)를
// trego-frontend 커밋·코드와 대조했다. "재구현 버전"은 trego-web-portfolio에서 한 일이다.
export type Story = {
  problem: string;
  rejected: readonly { option: string; reason: string }[];
  design: readonly string[];
  process?: string;
  // 원본과 재구현 버전 중 어디서 한 일인지 밝힐 때 쓴다.
  note?: string;
  limit: string;
};

export const tregoStories = {
  nav: {
    problem:
      "일정이 길어지면 스크롤 중에 지금 보는 장소가 어느 지역, 몇 일차인지 알기 어렵습니다. 기획에 없던 문제로, 직접 사용하면서 발견했습니다.",
    rejected: [
      { option: "고정 헤더", reason: "필요 없을 때도 공간을 차지합니다." },
      {
        option: "텍스트 경로('제주도 / 2일차')",
        reason:
          "첫 구현에 썼지만 목록 라벨과 모양이 달라 같은 항목으로 인식되지 않았습니다.",
      },
    ],
    design: [
      "원래 라벨이 화면 위로 사라질 때만 조상 경로를 표시합니다. 현재 행은 제외하고 조상만 보여 같은 라벨이 중복되지 않습니다.",
      "목록 행과 경로 막대가 같은 라벨 컴포넌트를 씁니다.",
      "지역이 바뀌는 지점에서는 다음 지역 라벨이 이전 라벨을 밀어 올립니다.",
      "경로가 없을 때도 같은 높이의 빈 막대를 두어 레이아웃이 움직이지 않습니다.",
    ],
    process:
      "처음에는 스크롤 방향을 JS로 판정했지만 조건이 계속 늘었습니다. sticky와 IntersectionObserver로 바꿨다가, 필요한 판정이 '보이는가'가 아니라 '기준선을 지났는가'여서 getBoundingClientRect로 기준선을 직접 계산하는 방식으로 바꿨습니다. 재구현 버전에서는 1~8px 단위로 스크롤하며 날짜가 한 행 늦게 표시되는 회귀를 찾아 수정했습니다.",
    limit:
      "라벨 글자가 행 가운데에 있어, 행이 다 가려지기 약 8px 전에 글자가 먼저 가려집니다. 기준선을 더 내리면 첫 폴더를 경로 막대가 덮기 때문에 현재 위치로 정했습니다.",
  },
  state: {
    problem:
      "같은 트리를 세 방식으로 조회해야 합니다. id로 노드를 찾고, 펼친 순서대로 렌더링하고, 순서를 바꿀 때는 한 부모의 자식 목록을 봅니다.",
    rejected: [
      {
        option: "트리 위치와 장소를 한 id로 관리",
        reason: "같은 장소를 여러 날짜에 넣는 경우를 표현할 수 없습니다.",
      },
      {
        option: "정수 순서와 뒤 형제 재번호",
        reason:
          "여러 사용자가 동시에 순서를 바꾸면 수정 범위가 넓어 충돌이 잦아집니다.",
      },
    ],
    design: [
      "서버에서 받은 평탄한 배열을 원본으로 두고, 조회 방식별 인덱스를 파생합니다.",
      "트리 위치(pathId)와 장소(id)를 분리해, 이동할 때는 위치 행의 부모와 position만 수정합니다.",
    ],
    // 확인 필요: 재귀 렌더링을 버린 이유가 문서에 없다. 실제 이유를 한 줄 덧붙인다.
    process:
      "처음에는 중첩 트리를 재귀로 렌더링했습니다. 2025년 8월에 평탄한 배열로 바꾸고 드래그 앤 드롭을 다시 구현했습니다.",
    limit:
      "첫 자식 position이 0이면 중간값을 계산할 수 없어 -0.1을 씁니다. 같은 위치에 반복 삽입해 소수 정밀도가 부족해지면 재정렬이 필요하지만, 현재 데이터 규모에서는 발생하지 않습니다.",
  },
  sync: {
    problem:
      "서버(SignalR Hub)는 받은 변경을 검증 없이 프로젝트 참여자 전원에게 전달하고, 보낸 사람도 같은 이벤트를 받습니다. 원본은 이 이벤트를 받은 뒤 화면을 갱신해서, 조작이 네트워크 왕복 시간만큼 늦게 반영됐습니다.",
    rejected: [
      {
        option: "서버 이벤트를 기다린 뒤 반영(원본 방식)",
        reason: "드래그처럼 즉시 반응해야 하는 조작에 맞지 않습니다.",
      },
      {
        option: "트리 전체 스냅샷으로 되돌리기",
        reason: "되돌릴 때 다른 사용자의 변경까지 사라집니다.",
      },
    ],
    design: [
      "로컬에 먼저 반영한 뒤 서버에 보냅니다. 같은 이벤트가 다시 와도 결과가 같도록 반영 함수를 멱등하게 만들고, 변경이 없으면 기존 배열 참조를 그대로 반환해 리렌더링을 건너뜁니다.",
      "실패하면 REST로 서버 상태를 다시 받아 기준으로 삼습니다.",
      "되돌리기는 작업마다 실행/되돌리기 명령 쌍을 기록합니다. 원본의 역명령 스택을 발전시킨 방식입니다.",
      "연결 하나를 일정·채팅·커서가 공유하고, 연결 관리·프로젝트 세션·기능별 명령을 세 계층으로 나눠 재연결 로직을 단위 테스트할 수 있게 했습니다.",
    ],
    note: "이 설계는 재구현 버전에서 정리했습니다. 보낸 사람도 이벤트를 받는다는 서버 제약은 원본 개발 중에 파악했습니다.",
    limit:
      "여러 명령으로 된 작업이 중간에 실패하면 이미 성공한 서버 변경은 되돌리지 못합니다. 해결하려면 백엔드에 트랜잭션 명령이 필요합니다. 서버를 수정할 수 있었다면 서버가 확정 상태를 내려주는 구조가 더 적절합니다.",
  },
} satisfies Record<"nav" | "state" | "sync", Story>;

// 확인 필요: 이력서는 4인(프론트 1, 백엔드 3), frontend-strengths.md는 7명이다. 코드 리뷰·API 계약 조율 범위도 문서에 없다.
export const tregoTeam = [
  "4인 구성 중 프론트엔드를 혼자 담당했습니다. 일정 트리 편집기, 장소 검색·상세, 지도 마커·경로, 팀 채팅, 커서 공유, 인증, 공유·초대 화면을 구현했습니다.",
  "협업 도구는 Jira와 Confluence를 사용했습니다.",
] as const;

// 홈 SurgiAuth 구간에 쓰는 고민. 첫 번째는 1차(인식기), 두 번째는 2차(격자)다.
export const surgiPairs = [
  {
    problem:
      "수집 화면에 방어가 없으면, 인증 제스처와 상관없는 손동작까지 샘플로 들어간다는 것을 확인했습니다.",
    decision:
      "Gesture Recognizer를 프론트에 넣어서 open palm으로 판정된 프레임만 받습니다.",
  },
  {
    problem:
      "open palm 샘플의 품질을 높이려면 다양한 각도에서 모아야 했습니다.",
    decision:
      "roll과 pitch를 두 축으로 5×3 칸을 만들고, 칸마다 2장씩 모읍니다.",
  },
] as const;

// 홈 드래그 데모의 변천 요약. 글 상세와 커밋은 features/dnd/config/chapters.ts에 있다.
export const dragSteps = [
  {
    id: "a",
    hint: "일정을 끌어 보세요. 놓일 자리에 선이 그어집니다",
    versions: "V1~V3",
    title: "어디에 놓이는지 알려준다",
    body: "선과 박스가 놓일 위치를 표시합니다. 놓기 전에는 결과를 알 수 없다는 불안을 줄이려고 만들었습니다.",
  },
  {
    id: "b",
    hint: "일정을 다른 날짜 위로 끌어 보세요. 자리가 열립니다",
    versions: "V4",
    title: "붙는다",
    body: "놓을 수 있는 자리가 열리고 미리보기가 붙습니다. 결과를 미리 보여 주면 사용자가 예측할 부분이 줄어듭니다.",
  },
  {
    id: "c",
    hint: "일정을 끌어 보세요. 지도 경로도 같이 바뀝니다",
    versions: "V5~V6",
    title: "앱 전체가 반응한다",
    body: "드래그하는 동안 앱 전체가 함께 반응하고, 놓기 전에 놓일 위치를 미리 보여 줍니다. 자동 펼침 직후에는 7.5px 이상 움직여야 드롭 판정을 다시 합니다. 지도는 데모용 좌표입니다.",
  },
] as const;

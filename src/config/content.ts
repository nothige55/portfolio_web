// 시안 세 개가 같이 쓰는 소개 내용. 출처는 이력서(trego_docs)이고, 수치는 공개 전에 다시 확인한다.
export const projects = [
  {
    id: "trego",
    name: "Trego",
    kicker: "실시간 협업 여행 일정 에디터",
    period: "2025.05 – 2026.02",
    role: "4인 · 프론트엔드 설계·구현 주도",
    summary:
      "여행 일정을 폴더 → 날짜 → 일정 트리로 다루고, 친구와 같은 일정을 동시에 편집하는 웹 에디터예요.",
    points: [
      {
        title: "스크롤 중에도 위치를 잃지 않는 탐색",
        body: "깊은 트리에서 지금 보는 장소가 어느 날짜인지 잃는 문제를 쓰다가 찾았어요. 고정 헤더 대신, 원래 라벨이 사라지는 순간에만 조상 경로가 이어받게 만들었어요.",
      },
      {
        title: "드래그 하나를 세 번 다시 만들었어요",
        body: "삽입선에서 자석 미리보기로, 다시 앱 전체가 반응하는 방식으로 바꿨어요. 자동 펼침 직후에는 7.5px 더 움직이기 전까지 드롭 판정을 미뤄요.",
      },
      {
        title: "계층 트리 상태 설계",
        body: "조회·렌더링·순서 변경이 다른 접근 방식을 요구해서, 원본 배열 하나에서 목적별 인덱스를 파생시켰어요.",
      },
      {
        title: "실시간 동시 편집",
        body: "서버 이벤트를 나에게 미리 보내는 방식으로 로컬과 서버의 상태가 어긋날 길을 없앴어요.",
      },
    ],
  },
  {
    id: "surgiauth",
    name: "SurgiAuth",
    kicker: "수술실 비접촉 제스처 인증",
    period: "2026.04 – 현재",
    role: "4인 · 프론트엔드(손 추적·인증 화면)",
    summary:
      "장갑을 낀 손으로 화면을 만질 수 없는 수술실에서, 카메라로 손 동작을 읽어 인증하는 졸업작품이에요.",
    points: [
      {
        title: "열기 → 쥐기 → 열기",
        body: "한 번의 동작이 아니라 동작의 순서로 인증해서 우연한 동작을 걸러내요.",
      },
      {
        title: "MediaPipe 손 추적",
        body: "브라우저에서 GPU를 먼저 써서 손 추적을 돌려요.",
      },
      {
        title: "Electron 단말 앱",
        body: "수술실 단말에서 실행되는 데스크톱 앱으로 묶었어요.",
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

export const approach =
  "요구사항에 없던 문제를 쓰다가 찾아내고, 흔한 해법이 왜 안 맞는지 따진 뒤 직접 설계해요.";

export type Note = { value: string; label: string };

export const surgiNotes: readonly Note[] = [
  { value: "±54° · ±30°", label: "roll과 pitch의 인식 한계예요. 넘으면 담지 않아요." },
  { value: "5 × 3", label: "roll 10°, pitch 18° 간격으로 나눈 칸이에요." },
  { value: "2장", label: "칸마다 채우는 수예요. 합쳐서 30장이에요." },
];

// 홈 SurgiAuth 구간에 쓰는 고민. 첫 번째는 1차(인식기), 두 번째는 2차(격자)다.
export const surgiPairs = [
  {
    problem: "수집 화면에 방어가 없으면, 인증 제스처와 상관없는 손동작까지 샘플로 들어간다는 걸 알았어요.",
    decision: "Gesture Recognizer를 프론트에 넣어서 open palm으로 판정된 프레임만 받아요.",
  },
  {
    problem: "open palm 샘플의 품질을 높이려면 다양한 각도에서 모아야 했어요.",
    decision: "roll과 pitch를 두 축으로 5×3 칸을 만들고, 칸마다 2장씩 모아요.",
  },
] as const;

// 드래그 변천 요약. 상세와 커밋은 features/dnd/config/chapters.ts에 있다.
export const dragSteps = [
  {
    id: "a",
    versions: "V1~V3",
    title: "어디에 놓이는지 알려준다",
    body: "선과 박스가 놓일 곳을 가리켜요. 놓아 보기 전에는 결과를 알 수 없다는 불안을 줄이려고 만들었어요.",
    mode: "line",
    axes: { judge: "포인터가 있는 세로 구역과 가로 깊이", feedback: "삽입선, 컨테이너 외곽선", child: "구역에 들어가면 바로" },
    changed: [],
  },
  {
    id: "b",
    versions: "V4",
    title: "붙는다",
    body: "놓을 수 있는 자리가 열리고 미리보기가 붙어요. 결과를 미리 앉혀 보여 주면 예측할 일이 줄어요.",
    mode: "magnet",
    axes: { judge: "가까운 허용 깊이로 붙음", feedback: "자리가 열리고 미리보기", child: "0.5초 머물면" },
    changed: ["judge", "feedback", "child"],
  },
  {
    id: "c",
    versions: "V5~V6",
    title: "앱 전체가 반응한다",
    body: "드래그하는 동안 지도가 함께 반응하고, 놓기 전에 바뀔 경로를 미리 보여 줘요. 컨테이너는 1초 채움이 끝나야 안으로 받고, 붙은 직후에는 7.5px 더 움직이기 전까지 판정을 미뤄요. 지도는 데모용 좌표예요.",
    mode: "fill",
    axes: { judge: "V4와 같음(허용 깊이에 붙음)", feedback: "채움 표시, 지도 경로 미리보기", child: "1초 채우면, 붙은 뒤 7.5px 데드존" },
    changed: ["feedback", "child"],
  },
] as const;

// 초안: Trego 작업 기록에서 정리한 내용이라 직접 다듬어 쓴다.
export type Chapter = {
  id: "a" | "b" | "c";
  versions: string;
  title: string;
  feel: string;
  reason: string;
  commits: readonly string[];
  // 이 데모 코드에 실제로 있는 설계만 적는다. 없으면 생략한다.
  design?: readonly string[];
};

export const chapters: readonly Chapter[] = [
  {
    id: "a",
    versions: "V1~V3",
    title: "어디에 놓이는지 알려준다",
    feel: "선과 박스가 놓일 곳을 가리키고, 마우스를 어디에 두느냐(세로 구역, 가로 깊이)가 의미를 갖는다.",
    reason:
      "놓아 보기 전에는 결과를 알 수 없다는 불안을 줄이려고 삽입선을 두었고, 구역 표시와 깊이 선택으로 넓혔다.",
    commits: ["d5f14ff", "026742d", "d9c8c26", "2d0d773", "44e0352", "8970c3a"],
    design: [
      "드롭 규칙을 순수 함수(calcNewPosition)로 빼서, 같은 입력이면 항상 같은 자리가 나와요. node:test로 확인해요.",
    ],
  },
  {
    id: "b",
    versions: "V4",
    title: "붙는다",
    feel: "놓을 수 있는 자리에 반투명 미리보기가 붙고 형제 항목이 벌어져 자리를 연다. 놓을 수 없는 곳에서는 미리보기가 사라진다.",
    reason: "선으로 가리키는 대신 결과를 미리 앉혀 보여 주면 사용자가 예측할 일이 줄어든다.",
    commits: ["282426a", "aa76544", "ca68b49"],
  },
  {
    id: "c",
    versions: "V5~V6",
    title: "앱 전체가 반응한다",
    feel: "드래그하는 동안 지도, 검색창, 펼침 상태가 함께 움직이고, 놓을 자리를 미리 보여 준다. (이 데모에는 펼침 상태와 지도 연동이 있고, 검색창 연동은 후속 작업으로 추가할 예정이에요.)",
    reason:
      "드래그는 목록만의 일이 아니라 앱 전체의 맥락이라서, 기다림과 실수 방지(빈 컨테이너는 채움이 끝난 뒤 허용)까지 설계 대상으로 넓혔다.",
    design: [
      "드래그 중 표시와 드롭 확정이 같은 규칙(planner-drop-rules.ts)을 따라서, 보여 준 자리와 놓인 자리가 어긋나지 않아요.",
      "위치는 이웃 두 행 사이의 중간값이라 다른 행의 위치를 바꾸지 않아요.",
      "트리는 원본 배열 하나에서 entityMap, childrenMap, flattenedItems를 파생해서 조회·자식 순회·렌더링에 나눠 써요.",
      "리스트가 놓을 자리를 보여 줄 때만 지도에 알려요.",
    ],
    commits: [
      "ca8490e",
      "19b1f85",
      "aade967",
      "14e5da0",
      "cfd103e",
      "913bd37",
      "6a11113",
      "be7259f",
      "86fa2d6",
    ],
  },
];

// 이 데모에는 없고 Trego 본 앱(trego-web-portfolio)에 있는 것. 근거 파일로 링크한다.
const REPO = "https://github.com/nothige55/trego-web-portfolio/blob/main";
export const appOnly = [
  {
    title: "일정과 지도의 양방향 연동",
    body: "마커를 누르면 목록이 펼쳐지며 그 일정이 선택되고, 행에 올린 커서는 지도 마커 강조로 이어져요. 이 데모는 드래그 중 지도로 가는 한 방향만 있어요.",
    href: "https://github.com/nothige55/trego-web-portfolio/pull/11",
    label: "PR 11",
  },
  {
    title: "Shift 다중 선택",
    body: "부모가 이미 선택되면 그 자손은 작업 대상에서 빼요. 안 그러면 삭제 한 번에 중복 명령이 나가요.",
    href: `${REPO}/src/features/planner/utils/calculate-shift-selection.ts`,
    label: "calculate-shift-selection.ts",
  },
] as const;

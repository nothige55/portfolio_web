// 초안: Trego 작업 기록에서 정리한 내용이라 직접 다듬어 쓴다.
export type Chapter = {
  id: "a" | "b" | "c";
  versions: string;
  title: string;
  feel: string;
  reason: string;
  commits: readonly string[];
  // Trego에서의 설계. 데모 코드나 trego-web-portfolio에서 확인되는 것만 적는다. 없으면 생략한다.
  design?: readonly string[];
};

export const chapters: readonly Chapter[] = [
  {
    id: "a",
    versions: "V1~V3",
    title: "어디에 놓이는지 알려준다",
    feel: "Trego의 일정 트리에서 선과 박스가 놓일 곳을 가리키고, 마우스를 어디에 두느냐(세로 구역, 가로 깊이)가 의미를 갖게 했어요.",
    reason:
      "놓아 보기 전에는 결과를 알 수 없다는 불안을 줄이려고 삽입선을 두었고, 구역 표시와 깊이 선택으로 넓혔어요.",
    commits: ["d5f14ff", "026742d", "d9c8c26", "2d0d773", "44e0352", "8970c3a"],
    design: [
      "놓일 자리를 정하는 규칙을 순수 함수(calcNewPosition)로 빼서, 같은 입력이면 항상 같은 자리가 나오게 했어요.",
    ],
  },
  {
    id: "b",
    versions: "V4",
    title: "붙는다",
    feel: "Trego에서 놓을 수 있는 자리에 반투명 미리보기가 붙고 형제 항목이 벌어져 자리를 열어요. 놓을 수 없는 곳에서는 미리보기가 사라져요.",
    reason: "선으로 가리키는 대신 결과를 미리 앉혀 보여 주면 사용자가 예측할 일이 줄어요.",
    commits: ["282426a", "aa76544", "ca68b49"],
  },
  {
    id: "c",
    versions: "V5~V6",
    title: "앱 전체가 반응한다",
    feel: "Trego에서는 드래그하는 동안 지도, 검색창, 펼침 상태가 함께 움직이고, 놓을 자리를 미리 보여 줘요.",
    reason:
      "드래그는 목록만의 일이 아니라 앱 전체의 맥락이라서, 기다림과 실수 방지(빈 컨테이너는 채움이 끝난 뒤 허용)까지 설계 대상으로 넓혔어요.",
    design: [
      "드래그 중에 보여 주는 자리와 놓았을 때 확정되는 자리가 같은 규칙(planner-drop-rules)을 따라서 어긋나지 않게 했어요.",
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

// 사이트 데모에는 담지 않았지만 Trego 본 앱(trego-web-portfolio)에 있는 것. 근거 파일로 링크한다.
const REPO = "https://github.com/nothige55/trego-web-portfolio/blob/main";
export const appOnly = [
  {
    title: "일정과 지도의 양방향 연동",
    body: "Trego에서는 마커를 누르면 목록이 펼쳐지며 그 일정이 선택되고, 행에 올린 커서는 지도 마커 강조로 이어져요.",
    href: "https://github.com/nothige55/trego-web-portfolio/pull/11",
    label: "PR 11",
  },
  {
    title: "Shift 다중 선택",
    body: "Trego에서는 부모가 이미 선택되면 그 자손을 작업 대상에서 빼요. 안 그러면 삭제 한 번에 중복 명령이 나가요.",
    href: `${REPO}/src/features/planner/utils/calculate-shift-selection.ts`,
    label: "calculate-shift-selection.ts",
  },
] as const;

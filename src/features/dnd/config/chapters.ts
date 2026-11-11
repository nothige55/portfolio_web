// 초안: Trego 작업 기록에서 정리한 내용이라 직접 다듬어 쓴다.
export type Chapter = {
  id: "a" | "b" | "c";
  versions: string;
  title: string;
  feel: string;
  reason: string;
  commits: readonly string[];
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
    feel: "드래그하는 동안 지도, 검색창, 펼침 상태가 함께 움직이고, 놓은 뒤의 경로 정보까지 미리 보인다. 빈 컨테이너는 머무는 동안 채워지다가 1초 뒤에야 받고, 붙은 직후에는 7.5px 더 움직일 때까지 판정을 미룬다.",
    reason:
      "드래그는 목록만의 일이 아니라 앱 전체의 맥락이라서, 기다림과 실수 방지(빈 컨테이너는 채움이 끝난 뒤 허용)까지 설계 대상으로 넓혔다.",
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

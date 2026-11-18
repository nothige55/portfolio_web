// V1~V3, V4, V5~V6 일정 행이 같은 모양으로 보이도록 세 데모가 함께 쓰는 치수
// 행 높이 30px은 원본 Trego 행 높이이고, V1~V3의 위·가운데·아래 구역 판정(10px 단위)과 V4의 자석 판정(7.5px)이 이 높이에 기대고 있다
// Tailwind 클래스는 문자열이 그대로 있어야 생성되므로 h-[30px], w-5는 컴포넌트에 직접 쓰고 이 값과 맞춘다
export const DND_ROW_HEIGHT = 30;
// 계층 1단계당 들여쓰기
export const DND_INDENT_WIDTH = 30;
// 펼침 버튼 칸. 자식이 없어도 비워 둬 라벨 시작점을 맞춘다
export const DND_TOGGLE_WIDTH = 20;

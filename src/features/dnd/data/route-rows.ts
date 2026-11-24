import { jejuSeed } from "@/features/dnd/data/jeju-seed";

// 지도가 트리에서 읽는 최소 정보: 누가 어느 부모의 몇 번째인지
export type RouteRow = {
  readonly pathId: string;
  readonly parentPathId: string | null;
  readonly position: number;
};

// 드래그 중 지금 놓으면 들어갈 자리. destination이 null이면 놓을 자리가 없어 원래 자리 그대로다
export type DragPreview = {
  readonly activePathId: string;
  readonly destination: { readonly parentPathId: string; readonly siblingIndex: number } | null;
};

export type DemoProps = {
  // 드래그하는 동안 놓일 자리를 알려 준다(지도가 미리 따라가려고). 끝나면 null
  onDragPreview?: (preview: DragPreview | null) => void;
  // 트리가 바뀔 때마다 현재 구조를 알려 준다(지도를 같은 순서로 그리려고)
  onRowsChange?: (rows: readonly RouteRow[]) => void;
  aside?: React.ReactNode;
};

export const seedRows: readonly RouteRow[] = jejuSeed.map(({ pathId, parentPathId, position }) => ({
  pathId,
  parentPathId,
  position,
}));

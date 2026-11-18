import { jejuSeed } from "@/features/dnd/data/jeju-seed";

// 지도가 트리에서 읽는 최소 정보: 누가 어느 부모의 몇 번째인지
export type RouteRow = {
  readonly pathId: string;
  readonly parentPathId: string | null;
  readonly position: number;
};

export type DemoProps = {
  // 트리가 바뀔 때마다 현재 구조를 알려 준다(지도를 같은 순서로 그리려고)
  onRowsChange?: (rows: readonly RouteRow[]) => void;
  aside?: React.ReactNode;
  // 바깥 카드가 이미 있으면 데모 자체의 테두리를 뺀다
  bare?: boolean;
};

export const seedRows: readonly RouteRow[] = jejuSeed.map(({ pathId, parentPathId, position }) => ({
  pathId,
  parentPathId,
  position,
}));

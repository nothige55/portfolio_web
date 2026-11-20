import type { DragPreview, RouteRow } from "./route-rows";

// 원본 handleDragMove처럼 잡은 장소를 놓일 자리에 미리 끼운 행을 만든다. 장소가 없는 자리(목적지 null)는 그대로 둔다
export function withDragPreview(rows: readonly RouteRow[], preview: DragPreview | null): readonly RouteRow[] {
  const destination = preview?.destination;
  if (!preview || !destination) return rows;
  const siblings = rows
    .filter((row) => row.parentPathId === destination.parentPathId && row.pathId !== preview.activePathId)
    .sort((a, b) => a.position - b.position)
    .map((row) => row.pathId);
  siblings.splice(Math.min(Math.max(destination.siblingIndex, 0), siblings.length), 0, preview.activePathId);
  const index = new Map(siblings.map((pathId, i) => [pathId, i]));
  return rows.map((row) => {
    if (row.pathId === preview.activePathId) {
      return { ...row, parentPathId: destination.parentPathId, position: index.get(row.pathId) ?? 0 };
    }
    return row.parentPathId === destination.parentPathId ? { ...row, position: index.get(row.pathId) ?? row.position } : row;
  });
}

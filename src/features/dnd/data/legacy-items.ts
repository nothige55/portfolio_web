// V1~V4(trego-frontend, JS)는 노드 종류를 folderId·dayId·activityId 중 무엇이 있는지로 가렸고,
// 계층 깊이를 hierarchy(root 0)로 들고 다녔다. 공통 시드를 그 모양으로 바꿔 옛 코드가 그대로 읽게 한다.

import type { PlannerNode } from "@/features/dnd/stage-c/types/planner-node";

export type LegacyItem = {
  readonly pathId: string;
  readonly parentPathId: string | null;
  readonly position: number;
  readonly name: string;
  readonly folderId?: string;
  readonly dayId?: string;
  readonly activityId?: string;
  readonly folderType?: string | null;
  readonly activityType?: string | null;
  readonly color?: string | null;
  readonly hierarchy: number;
};

export type LegacyReorder = {
  readonly pathId: string;
  readonly parentPathId: string;
  readonly newPosition: number;
};

export function toLegacyItems(nodes: readonly PlannerNode[]): LegacyItem[] {
  return nodes.map((node) => ({
    pathId: node.pathId,
    parentPathId: node.parentPathId,
    position: node.position,
    name: node.name,
    color: node.color ?? null,
    hierarchy: 0,
    ...(node.kind === "folder" && { folderId: node.id, folderType: node.folderType }),
    ...(node.kind === "day" && { dayId: node.id }),
    ...(node.kind === "activity" && { activityId: node.id, activityType: node.activityType }),
  }));
}

// 원본은 useEffect에서 items 객체에 hierarchy를 직접 써넣었다. 같은 값을 새 객체로 계산한다.
export function withHierarchy(items: readonly LegacyItem[]): LegacyItem[] {
  const depthByPathId = new Map<string, number>();
  const depthOf = (item: LegacyItem): number => {
    const cached = depthByPathId.get(item.pathId);
    if (cached !== undefined) return cached;
    const parent = items.find((candidate) => candidate.pathId === item.parentPathId);
    const depth = parent ? depthOf(parent) + 1 : 0;
    depthByPathId.set(item.pathId, depth);
    return depth;
  };
  return items.map((item) => ({ ...item, hierarchy: depthOf(item) }));
}

// 원본 store의 updatePath / updatePathStore: 옮긴 노드의 부모와 position만 바꾼다
export function applyLegacyReorder(
  items: readonly LegacyItem[],
  { pathId, parentPathId, newPosition }: LegacyReorder,
): LegacyItem[] {
  return withHierarchy(
    items.map((item) =>
      item.pathId === pathId ? { ...item, parentPathId, position: newPosition } : item,
    ),
  );
}

export function sortedChildren(items: readonly LegacyItem[], parentPathId: string): LegacyItem[] {
  return items
    .filter((item) => item.parentPathId === parentPathId)
    .sort((a, b) => a.position - b.position);
}

// 화면 순서(깊이 우선)대로 Day에 1부터 번호를 붙인다
export function buildDayNumbers(items: readonly LegacyItem[]): Map<string, number> {
  const numbers = new Map<string, number>();
  const visit = (parentPathId: string) => {
    for (const child of sortedChildren(items, parentPathId)) {
      if (child.dayId) numbers.set(child.pathId, numbers.size + 1);
      if (!child.activityId) visit(child.pathId);
    }
  };
  const root = items.find((item) => item.parentPathId === null);
  if (root) visit(root.pathId);
  return numbers;
}

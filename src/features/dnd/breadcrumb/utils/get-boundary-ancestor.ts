// Trego getPlannerRowAdornments에서 boundaryAncestor 계산만 뽑음 (드래그·경로 정보 분기 제외)
// 다음 최상위 노드가 breadcrumb 아랫변에 닿으면 breadcrumb이 비므로, 앞 행 아래에 이전 구간의 최상위 라벨을 붙임

import type { FlattenedPlannerNode, PlannerTree } from "@/features/dnd/stage-c/types/planner-node";

export function getBoundaryAncestor({
  node,
  nextNode,
  tree,
  rootPathId,
  topItemId,
}: {
  node: FlattenedPlannerNode;
  nextNode?: FlattenedPlannerNode;
  tree: PlannerTree;
  rootPathId: string;
  topItemId: string | null;
}): FlattenedPlannerNode | undefined {
  if (!(nextNode?.depth === 1 && nextNode.pathId === topItemId && node.depth !== 1)) {
    return undefined;
  }

  let current = node;
  while (current.parentPathId) {
    const parent = tree.entityMap.get(current.parentPathId);
    if (!parent || parent.pathId === rootPathId) break;
    current = parent;
  }
  return current;
}

// 현재 스크롤 상단 노드에서 root 직전까지 올라가 화면에 표시할 경로를 만듦
// trego-web-portfolio get-planner-breadcrumb-ancestors.ts 그대로

import type {
  FlattenedPlannerNode,
  PlannerNodePathId,
} from "@/features/dnd/stage-c/types/planner-node";

export function getPlannerBreadcrumbAncestors(
  topItemId: PlannerNodePathId | null,
  rootPathId: PlannerNodePathId | null,
  entityMap: ReadonlyMap<PlannerNodePathId, FlattenedPlannerNode>,
): FlattenedPlannerNode[] {
  const ancestors: FlattenedPlannerNode[] = [];
  let currentItem = topItemId ? entityMap.get(topItemId) : undefined;

  while (currentItem?.parentPathId) {
    const parent = entityMap.get(currentItem.parentPathId);
    if (!parent || parent.pathId === rootPathId) {
      break;
    }

    ancestors.unshift(parent);
    currentItem = parent;
  }

  return ancestors;
}

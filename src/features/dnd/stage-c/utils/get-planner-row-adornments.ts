// 행 자체의 상태가 아니라 이웃 관계에서 나오는 표시 요소를 계산
// 렌더 루프 안에 두면 트리 탐색과 JSX가 섞이므로 순수 함수로 분리
// trego-web-portfolio get-planner-row-adornments.ts에서 가져옴
// 수정: 데모는 경로 정보(이동 수단·거리)를 걷어냈으므로 previousActivity·hasRouteSlot·showsRouteInfo와
// 투영(projection) 인자는 뺐다. breadcrumb와 이어지는 구간 경계 라벨(boundaryAncestor) 계산은 그대로다

import type {
  FlattenedPlannerNode,
  PlannerNodePathId,
  PlannerTree,
} from "@/features/dnd/stage-c/types/planner-node";

export type PlannerRowAdornments = {
  // 다음 최상위 노드가 breadcrumb 아랫변까지 올라왔을 때 이 행 아래쪽에 붙일 이전 구간의 최상위 라벨
  // 다음 구간에 밀려 함께 올라가므로, 행 높이(메모 유무)와 상관없이 breadcrumb 자리에서 이어받음
  readonly boundaryAncestor?: FlattenedPlannerNode;
};

function getTopAncestor(
  node: FlattenedPlannerNode,
  tree: PlannerTree,
  rootPathId: PlannerNodePathId | null,
): FlattenedPlannerNode {
  let currentItem = node;

  while (currentItem.parentPathId) {
    const parent = tree.entityMap.get(currentItem.parentPathId);
    if (!parent || parent.pathId === rootPathId) {
      break;
    }
    currentItem = parent;
  }

  return currentItem;
}

export function getPlannerRowAdornments({
  node,
  nextNode,
  tree,
  rootPathId,
  topItemId,
  isDragging,
}: {
  readonly node: FlattenedPlannerNode;
  readonly nextNode?: FlattenedPlannerNode;
  readonly tree: PlannerTree;
  readonly rootPathId: PlannerNodePathId | null;
  readonly topItemId: PlannerNodePathId | null;
  readonly isDragging: boolean;
}): PlannerRowAdornments {
  // 형제가 하나뿐인 root 직속 자식은 조상을 겹쳐 봐도 얻는 정보가 없음
  const isAloneAndRootChild =
    (tree.childrenMap.get(node.parentPathId) ?? []).length === 1 && node.depth === 2;
  const boundaryAncestor =
    !isDragging &&
    nextNode?.depth === 1 &&
    nextNode.pathId === topItemId &&
    node.depth !== 1 &&
    !isAloneAndRootChild
      ? getTopAncestor(node, tree, rootPathId)
      : undefined;

  return { boundaryAncestor };
}

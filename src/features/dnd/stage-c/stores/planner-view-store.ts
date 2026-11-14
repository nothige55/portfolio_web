// 원본 planner-view-store에서 드래그 데모에 필요한 부분(트리, 펼침, 이동)만 남긴 store
// 선택, hover, 프로젝트 정보, 서버 동기화는 이 데모에서 쓰지 않아 뺐다

import { create } from "zustand";

import { jejuSeed, ROOT_PATH_ID } from "@/features/dnd/data/jeju-seed";
import { applyPlannerDrop } from "@/features/dnd/stage-c/dnd/apply-planner-drop";
import type { PlannerDropDestination } from "@/features/dnd/stage-c/dnd/planner-drop-rules";
import type { PlannerNodePathId, PlannerTree } from "@/features/dnd/stage-c/types/planner-node";
import { buildPlannerTree } from "@/features/dnd/stage-c/utils/build-planner-tree";

interface PlannerViewState {
  readonly tree: PlannerTree;
  readonly rootPathId: PlannerNodePathId;
  readonly expandedIds: ReadonlySet<PlannerNodePathId>;
  toggleExpanded: (pathId: PlannerNodePathId) => void;
  expandNode: (pathId: PlannerNodePathId) => void;
  moveNode: (pathId: PlannerNodePathId, destination: PlannerDropDestination) => void;
  reset: () => void;
}

// 데모는 과제(8/14 → 8/12)가 바로 보이도록 모든 컨테이너를 펼친 채 시작
function createInitialState() {
  const tree = buildPlannerTree(jejuSeed);
  return {
    tree,
    rootPathId: ROOT_PATH_ID,
    expandedIds: new Set(
      tree.flattenedItems
        .filter((node) => (tree.childrenMap.get(node.pathId) ?? []).length > 0)
        .map((node) => node.pathId),
    ),
  };
}

export const usePlannerViewStore = create<PlannerViewState>((set) => ({
  ...createInitialState(),
  reset() {
    set(createInitialState());
  },
  moveNode(pathId, destination) {
    set((state) => ({ tree: applyPlannerDrop(state.tree, pathId, destination) }));
  },
  toggleExpanded(pathId) {
    set((state) => {
      if ((state.tree.childrenMap.get(pathId) ?? []).length === 0) {
        return state;
      }

      const expandedIds = new Set(state.expandedIds);
      if (expandedIds.has(pathId)) {
        expandedIds.delete(pathId);
      } else {
        expandedIds.add(pathId);

        // 접힌 조상 아래의 노드를 열더라도 대상이 실제로 보이도록 모든 조상도 펼침
        let currentNode = state.tree.entityMap.get(pathId);
        while (currentNode?.parentPathId) {
          expandedIds.add(currentNode.parentPathId);
          currentNode = state.tree.entityMap.get(currentNode.parentPathId);
        }
      }

      return { expandedIds };
    });
  },
  expandNode(pathId) {
    set((state) => {
      if (
        state.expandedIds.has(pathId) ||
        (state.tree.childrenMap.get(pathId) ?? []).length === 0
      ) {
        return state;
      }

      const expandedIds = new Set(state.expandedIds);
      let currentNode = state.tree.entityMap.get(pathId);

      while (currentNode) {
        expandedIds.add(currentNode.pathId);
        currentNode = currentNode.parentPathId
          ? state.tree.entityMap.get(currentNode.parentPathId)
          : undefined;
      }

      return { expandedIds };
    });
  },
}));

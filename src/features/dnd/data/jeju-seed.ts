// 세 단계 데모가 함께 쓰는 일정. 모든 버전이 같은 과제(8/14 동문시장을 8/12 공항과 이호테우 사이로)를 푼다.
// 형태는 V5~V6(trego-web-portfolio)의 PlannerNode를 따르고, V1~V4는 legacy-items.ts에서 옛 필드로 바꿔 쓴다.

import type {
  PlannerActivityNode,
  PlannerDayNode,
  PlannerFolderNode,
  PlannerNode,
} from "@/features/dnd/stage-c/types/planner-node";

function folder(
  pathId: string,
  parentPathId: string | null,
  position: number,
  name: string,
  folderType: string | null,
): PlannerFolderNode {
  return { kind: "folder", id: pathId, pathId, parentPathId, position, name, folderType };
}

function day(
  pathId: string,
  parentPathId: string,
  position: number,
  name: string,
  color: string,
): PlannerDayNode {
  return { kind: "day", id: pathId, pathId, parentPathId, position, name, color };
}

function place(
  pathId: string,
  parentPathId: string,
  position: number,
  name: string,
  latitude: number,
  longitude: number,
): PlannerActivityNode {
  return {
    kind: "activity",
    id: pathId,
    pathId,
    parentPathId,
    position,
    name,
    activityType: "single",
    memo: null,
    markerType: null,
    travelMode: "car",
    travelTime: null,
    travelDistance: null,
    travelCost: null,
    startTime: null,
    endTime: null,
    placeId: null,
    latitude,
    longitude,
    googlePlaceId: null,
  };
}

export const ROOT_PATH_ID = "root";

export const jejuSeed: readonly PlannerNode[] = [
  folder(ROOT_PATH_ID, null, 0, "제주 여행", "root"),
  folder("jeju", ROOT_PATH_ID, 0.1, "제주도", "default"),
  day("d12", "jeju", 0.1, "8월 12일", "#F44336"),
  place("airport", "d12", 0.1, "공항", 33.5104, 126.4914),
  place("iho", "d12", 0.2, "이호테우", 33.4979, 126.4531),
  place("hyeopjae", "d12", 0.3, "협재해수욕장", 33.3943, 126.2396),
  day("d13", "jeju", 0.2, "8월 13일", "#4CAF50"),
  place("osulloc", "d13", 0.1, "오설록", 33.3059, 126.2895),
  place("hallim", "d13", 0.2, "한림공원", 33.3894, 126.2393),
  day("d14", "jeju", 0.3, "8월 14일", "#2196F3"),
  place("dongmun", "d14", 0.1, "동문시장", 33.5113, 126.5265),
  place("hamdeok", "d14", 0.2, "함덕해변", 33.5432, 126.6696),
  day("d15", "jeju", 0.4, "8월 15일", "#9C27B0"),
  folder("wish", ROOT_PATH_ID, 0.2, "가고 싶은 곳", "wish"),
  place("seongsan", "wish", 0.1, "성산일출봉", 33.4588, 126.9425),
];

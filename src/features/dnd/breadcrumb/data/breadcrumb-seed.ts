// breadcrumb 체험용 일정. 폴더 > 날짜 > 장소 3단 구조를 폴더 3개로 길게 이어 두어,
// 스크롤하면 경로가 날짜 단위로 바뀌다 폴더가 바뀌는 지점(경계 라벨)까지 한 번에 겪게 함.
// 맨 끝의 폴더 없는 날짜는 같은 규칙이 최상위 날짜에도 적용되는 것을 보여 줌

import type { PlannerNode } from "@/features/dnd/stage-c/types/planner-node";

export const BREADCRUMB_ROOT_ID = "root";

const base = (pathId: string, parentPathId: string | null, position: number, name: string) => ({
  id: pathId,
  pathId,
  parentPathId,
  position,
  name,
});

const folder = (id: string, name: string, position: number): PlannerNode => ({
  ...base(id, BREADCRUMB_ROOT_ID, position, name),
  kind: "folder",
  folderType: "default",
});

const day = (id: string, parent: string, position: number, name: string, color: string): PlannerNode => ({
  ...base(id, parent, position, name),
  kind: "day",
  color,
});

const places = (parent: string, names: readonly string[]): PlannerNode[] =>
  names.map((name, i) => ({
    ...base(`${parent}-${i}`, parent, i + 1, name),
    kind: "activity",
    activityType: "single",
    memo: null,
    markerType: null,
    startTime: null,
    endTime: null,
    placeId: null,
    latitude: null,
    longitude: null,
    googlePlaceId: null,
  }));

export const breadcrumbSeed: readonly PlannerNode[] = [
  { ...base(BREADCRUMB_ROOT_ID, null, 0, "제주 여행"), kind: "folder", folderType: "root" },
  folder("jeju-city", "제주시", 1),
  day("d12", "jeju-city", 1, "8월 12일", "#F44336"),
  ...places("d12", ["제주공항", "이호테우해변", "흑돼지거리"]),
  day("d13", "jeju-city", 2, "8월 13일", "#FF9800"),
  ...places("d13", ["동문시장", "용두암", "애월 카페"]),
  folder("seogwipo", "서귀포", 2),
  day("d14", "seogwipo", 1, "8월 14일", "#4CAF50"),
  ...places("d14", ["천지연폭포", "올레시장", "새연교"]),
  day("d15", "seogwipo", 2, "8월 15일", "#2196F3"),
  ...places("d15", ["오설록", "협재해수욕장", "한림공원"]),
  folder("east", "제주 동부", 3),
  day("d16", "east", 1, "8월 16일", "#9C27B0"),
  ...places("d16", ["성산일출봉", "섭지코지", "함덕해변"]),
  day("d17", BREADCRUMB_ROOT_ID, 4, "8월 17일", "#607D8B"),
  ...places("d17", ["제주공항", "탑승"]),
];

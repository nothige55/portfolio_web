// trego-frontend aa76544 src/features/dnd/utils/dndCondition.js 이식

import type { LegacyItem } from "@/features/dnd/data/legacy-items";

type ChildrenMap = ReadonlyMap<string, readonly LegacyItem[]>;

const isValidChildDrop = ({
  expandedIds,
  childrenMap,
  overItem,
  activeItem,
}: {
  expandedIds: ReadonlySet<string>;
  childrenMap: ChildrenMap;
  overItem: LegacyItem | undefined;
  activeItem: LegacyItem | undefined;
}) => {
  if (!overItem || !activeItem) return false;
  // 자식이 존재하고 펼쳐진 상태면 자식으로 드랍 불가
  if ((childrenMap.get(overItem.pathId)?.length ?? 0) > 0) {
    if (expandedIds.has(overItem.pathId)) {
      return false;
    }
  }
  if (overItem.folderType === "default") {
    if (activeItem.folderId || activeItem.dayId) return true;
  }
  if (overItem.folderType === "wish") {
    if (activeItem.activityId) return true;
  }
  if (overItem.dayId) {
    if (activeItem.activityId) return true;
  }
  if (overItem.activityType === "group") {
    if (activeItem.activityType === "single") return true;
  }
  return false;
};

const isValidSiblingDrop = ({
  activeItem,
  prevItem,
  nextItem,
}: {
  activeItem: LegacyItem | undefined;
  prevItem: LegacyItem | undefined;
  nextItem: LegacyItem | undefined;
}) => {
  if (
    (prevItem?.dayId || prevItem?.folderId || prevItem?.position === 0) &&
    (nextItem?.dayId || nextItem?.folderId || !nextItem) &&
    (activeItem?.dayId || activeItem?.folderId)
  ) {
    // console.log('형제 드롭 가능 - 폴더/데이');
    return true;
  }
  if (activeItem?.activityId && (prevItem?.activityId || nextItem?.activityId)) {
    // console.log('형제 드롭 가능 - 액티비티');
    return true;
  }
  if (prevItem?.activityId && nextItem?.dayId && (activeItem?.dayId || activeItem?.folderId)) {
    // console.log('day/activity 사이에 day/folder 드롭 가능');
    return true;
  }
  // prevItem이 root인 경우 (position 0) 액티비티는 드롭 불가
  // 수정: 원본은 prevItem이 없을 때 여기서 멈췄다(prevItem.position)
  if (prevItem?.position === 0 && activeItem?.activityId) {
    return false;
  }
  return false;
};

const prevIsLastSibling = ({
  prevItem,
  activeItem,
  nextItem,
}: {
  prevItem: LegacyItem;
  activeItem: LegacyItem;
  nextItem: LegacyItem;
}) => {
  if (activeItem.folderId) {
    if (prevItem.folderId || prevItem.dayId) return "both";
    if (prevItem.activityId) return "next";
  }
  if (activeItem.dayId) {
    if (prevItem.folderId || prevItem.dayId) return "both";
    if (prevItem.activityId) return "next";
  }
  if (activeItem.activityId) {
    if (prevItem.activityId) {
      if (nextItem.activityId) return "both";
      return "prev";
    }
    return "next";
  }
  // prev가 activity, next가 day/folder, active가 day/folder인 경우 activity의 부모 day와 형제로 드랍하는 걸 원하는 경우가 고려해야할거 같은데
  return null;
};
export { isValidChildDrop, isValidSiblingDrop, prevIsLastSibling };

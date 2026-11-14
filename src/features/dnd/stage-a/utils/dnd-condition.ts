// trego-frontend 8970c3a src/features/dnd/utils/dndCondition.js 이식
// 이 시기 규칙은 "날짜 안에 날짜", "자기 자신·자손 위"만 막았다. 장소를 폴더 형제로 두는 것 같은 종류 규칙은 V4에서 생긴다.

import type { LegacyItem } from "@/features/dnd/data/legacy-items";

export default function dndCondition({
  activeId,
  overId,
  items,
}: {
  activeId: string;
  overId: string;
  items: readonly LegacyItem[];
}) {
  const activeItem = items.find((item) => item.pathId === activeId); // 드래그 중인 아이템
  const overItem = items.find((item) => item.pathId === overId); // 드래그 중인 아이템 위에 있는 아이템

  // 수정: 원본은 두 아이템이 늘 있다고 보고 바로 필드를 읽었다
  if (!activeItem || !overItem) {
    return { isInvalidDrop: true, isInvalidChildDrop: true };
  }

  const isSelfDrop = activeId === overId;

  const dayOnDay = Boolean(activeItem.dayId && overItem.dayId);
  const onActivity = Boolean(overItem.activityId);

  const dayInDay = Boolean(
    activeItem.dayId && items.find((item) => item.pathId === overItem.parentPathId)?.dayId,
  );

  const getParentItem = (targetItem: LegacyItem) =>
    items.find((item) => item.pathId === targetItem.parentPathId);

  const checkChild = () => {
    let currentItem: LegacyItem | undefined = overItem;
    while (currentItem) {
      if (currentItem.pathId === activeItem.pathId) {
        return true;
      }
      currentItem = getParentItem(currentItem);
    }
    return false;
  };

  const isInvalidDrop = dayInDay || isSelfDrop || checkChild();

  const isInvalidChildDrop = dayOnDay || onActivity || isInvalidDrop;

  return {
    isInvalidDrop,
    isInvalidChildDrop,
  };
}

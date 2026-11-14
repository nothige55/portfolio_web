// trego-frontend 8970c3a src/features/dnd/utils/calcNewPosition.js 이식

import { type LegacyItem, sortedChildren } from "@/features/dnd/data/legacy-items";
import type { DropZone } from "@/features/dnd/stage-a/utils/drop-zone";

export default function calcNewPosition({
  items,
  overItem,
  position,
  newParentPathId,
  ancestor,
}: {
  items: readonly LegacyItem[];
  overItem: LegacyItem;
  position: DropZone;
  newParentPathId: string;
  ancestor: LegacyItem | undefined;
}): number | null {
  const siblings = sortedChildren(items, newParentPathId);

  if (position === "middle") {
    return siblings.length > 0 ? siblings[siblings.length - 1].position + 0.1 : 0.1; // 빈 배열일 경우 초기값 설정
  }

  if (position === "firstChild") {
    // 수정: 원본은 자식이 없을 때 siblings[0]이 없어 멈췄다
    if (siblings.length === 0) return 0.1;
    return parseFloat(((0 + siblings[0].position) / 2).toFixed(10));
  }

  const overIdx = siblings.findIndex((item) => item.pathId === overItem.pathId);

  if (overIdx === -1) {
    if (siblings.length > 0 && ancestor) {
      const ancestorIdx = siblings.findIndex((item) => item.pathId === ancestor.pathId);
      // 수정: 조상이 이 형제 목록에 없으면(-1) 원본은 undefined를 읽었다. 끝에 붙인다
      if (ancestorIdx === -1) return siblings[siblings.length - 1].position + 0.1;
      // 수정: 원본은 조상이 마지막 형제면 다음 값으로 0.2를 썼다. 조상 position이 0.2보다 크면
      // 중간값이 조상보다 작아져 조상 "앞"에 놓였다. 조상 position + 0.2로 바꿨다
      return parseFloat(
        (
          (siblings[ancestorIdx].position +
            (siblings[ancestorIdx + 1]?.position ?? siblings[ancestorIdx].position + 0.2)) /
          2
        ).toFixed(10),
      ); // 계층 탈출시 부모의 인덱스 다음으로 이동
    }
    return 0.1;
  }

  if (position === "top") {
    return parseFloat(
      ((siblings[overIdx].position + (siblings[overIdx - 1]?.position || 0)) / 2).toFixed(10),
    );
  }

  if (position === "bottom") {
    return parseFloat(
      (
        (siblings[overIdx].position +
          (siblings[overIdx + 1]?.position || siblings[overIdx].position + 0.2)) /
        2
      ).toFixed(10),
    );
  }

  return null;
}

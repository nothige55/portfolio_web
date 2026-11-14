// trego-frontend 8970c3a src/features/dnd/utils/determineNewParentPathId.js 이식

import type { LegacyItem } from "@/features/dnd/data/legacy-items";
import type { DropZone } from "@/features/dnd/stage-a/utils/drop-zone";

export default function determineNewParentPathId({
  overItem,
  position,
  hierarchy,
  ancestor,
  isLastSibling,
}: {
  overItem: LegacyItem;
  position: DropZone;
  hierarchy: number;
  ancestor: LegacyItem | undefined;
  isLastSibling: boolean;
}): string | null {
  if (position === "middle") {
    return overItem.pathId;
  }

  if (position === "bottom" && hierarchy < overItem.hierarchy && isLastSibling) {
    return ancestor ? ancestor.parentPathId : overItem.parentPathId;
  }

  if (position === "firstChild") {
    return overItem.pathId;
  }

  return overItem.parentPathId;
}

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

// 세 데모가 같은 틀(원본 일정 패널 폭 320px, 처음으로 버튼)을 쓴다. aside는 패널 옆에 놓는다(지도)
// 홈 DragStory가 --asm-* 변수로 트리·지도를 따로 조립해 등장시킨다. 변수가 없으면 이동 없음.
// 홈 앱 창: 사이드바는 창 높이 전체(트리만 스크롤), 지도는 남는 자리 전부. 모바일(<lg)은 위아래로 쌓는다
export function DemoFrame({
  onReset,
  children,
  aside,
}: {
  onReset: () => void;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
      <div className="flex w-full shrink-0 flex-col border-b bg-card [opacity:var(--asm-tree-o,1)] [translate:var(--asm-tree-x,0px)_var(--asm-tree-y,0px)] max-lg:max-h-96 lg:min-h-0 lg:w-80 lg:border-r lg:border-b-0">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b py-2 pr-2 pl-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">제주도 7일 여행</p>
            <p className="text-xs text-muted-foreground">08.12 – 08.18</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            처음으로
          </Button>
        </div>
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto py-2">{children}</div>
      </div>
      {/* scale은 빼고 이동·투명도로만 등장시킨다. Mapbox는 getBoundingClientRect로 크기를 재며 transform만 보정하고 CSS scale은 보정하지 않아, 0.94배일 때 만들어진 지도가 그 크기로 굳는다 */}
      <div className="relative h-80 min-w-0 [opacity:var(--asm-map-o,1)] [translate:var(--asm-map-x,0px)_var(--asm-map-y,0px)] lg:h-auto lg:flex-1">
        {aside}
      </div>
    </div>
  );
}

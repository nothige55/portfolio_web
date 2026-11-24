import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 세 데모가 같은 틀(원본 일정 패널 폭 320px, 처음으로 버튼)을 쓴다. aside는 패널 옆에 놓는다(지도)
// 홈 DragStory가 --asm-* 변수로 트리·지도를 따로 조립해 등장시킨다. 변수가 없으면 이동 없음.
export function DemoFrame({
  onReset,
  children,
  aside,
  bare,
  fill,
}: {
  onReset: () => void;
  children: ReactNode;
  aside?: ReactNode;
  bare?: boolean;
  fill?: boolean;
}) {
  // 홈 앱 창: 사이드바는 창 높이 전체(트리만 스크롤), 지도는 남는 자리 전부. 모바일(<lg)은 위아래로 쌓는다
  if (fill) {
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
        <div className="relative h-80 min-w-0 [opacity:var(--asm-map-o,1)] [scale:var(--asm-map-s,1)] [translate:var(--asm-map-x,0px)_var(--asm-map-y,0px)] lg:h-auto lg:flex-1">
          {aside}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("mx-auto w-full", !bare && "max-w-[1100px] rounded-xl border border-border p-4 sm:p-8")}>
      <div className={cn("mx-auto flex w-full flex-col gap-6", aside ? "max-w-[860px] md:flex-row md:justify-center" : "max-w-80")}>
        <div className="w-full max-w-80 shrink-0 space-y-3 [opacity:var(--asm-tree-o,1)] [translate:var(--asm-tree-x,0px)_var(--asm-tree-y,0px)] max-md:mx-auto">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset}>
              처음으로
            </Button>
          </div>
          <div className="rounded-lg border bg-card py-2">{children}</div>
          <p className="text-xs text-muted-foreground">마우스로 체험하는 데모입니다. 데스크톱에서 보세요.</p>
        </div>
        {aside && (
          <div className="w-full max-w-md pt-10 [opacity:var(--asm-map-o,1)] [scale:var(--asm-map-s,1)] [translate:var(--asm-map-x,0px)_var(--asm-map-y,0px)] max-md:mx-auto">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 세 데모가 같은 틀(원본 일정 패널 폭 320px, 처음으로 버튼)을 쓴다. aside는 패널 옆에 놓는다(지도)
export function DemoFrame({
  onReset,
  children,
  aside,
  bare,
}: {
  onReset: () => void;
  children: ReactNode;
  aside?: ReactNode;
  bare?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full", !bare && "max-w-[1100px] rounded-xl border border-border p-4 sm:p-8")}>
      <div className={cn("mx-auto flex w-full flex-col gap-6", aside ? "max-w-[860px] md:flex-row md:justify-center" : "max-w-80")}>
        <div className="w-full max-w-80 shrink-0 space-y-3 max-md:mx-auto">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset}>
              처음으로
            </Button>
          </div>
          <div className="rounded-lg border bg-card py-2">{children}</div>
          <p className="text-xs text-muted-foreground">마우스로 체험하는 데모입니다. 데스크톱에서 보세요.</p>
        </div>
        {aside && <div className="w-full max-w-md pt-10 max-md:mx-auto">{aside}</div>}
      </div>
    </div>
  );
}

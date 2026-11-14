import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

// 세 데모가 같은 틀(원본 일정 패널 폭 320px, 처음으로 버튼)을 쓴다
export function DemoFrame({ onReset, children }: { onReset: () => void; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-border p-4 sm:p-8">
      <div className="mx-auto w-full max-w-80 space-y-3">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            처음으로
          </Button>
        </div>
        <div className="rounded-lg border bg-card py-2">{children}</div>
        <p className="text-xs text-muted-foreground">마우스로 체험하는 데모예요. 데스크톱에서 보세요.</p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const ROW = 36;
type Row = { label: string; depth: number };

const rows: Row[] = ["제주 동부", "제주 서부"].flatMap((folder, f) => [
  { label: folder, depth: 0 },
  ...["8/12", "8/13"].flatMap((day, d) => [
    { label: day, depth: 1 },
    ...["공항", "카페", "식당"].map((a) => ({ label: `${a} ${f * 2 + d + 1}`, depth: 2 })),
  ]),
]);

function ancestors(index: number) {
  const path: string[] = [];
  let depth = rows[index].depth;
  for (let i = index - 1; i >= 0 && depth > 0; i--) {
    if (rows[i].depth < depth) {
      path.unshift(rows[i].label);
      depth = rows[i].depth;
    }
  }
  return path;
}

export function BreadcrumbDemo() {
  const [top, setTop] = useState(0);
  const path = ancestors(top);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        스크롤하면 사라진 라벨의 조상 경로가 그 자리를 이어받아요. 현재 행은 경로에서 빼요.
      </p>
      <div className="relative overflow-hidden rounded-lg border">
        <div
          aria-live="off"
          className={`absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-1 border-b bg-card/95 px-3 text-xs backdrop-blur transition-all duration-200 ${path.length ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
        >
          {path.join("  ›  ")}
        </div>
        <div
          tabIndex={0}
          aria-label="일정 트리"
          className="h-56 overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onScroll={(e) => {
            const next = Math.min(rows.length - 1, Math.floor(e.currentTarget.scrollTop / ROW));
            if (next !== top) setTop(next);
          }}
        >
          {rows.map((r, i) => (
            <div
              key={i}
              className={`flex items-center text-sm ${r.depth === 0 ? "font-bold" : ""}`}
              style={{ height: ROW, paddingLeft: 12 + r.depth * 20 }}
            >
              {r.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActiveSection } from "@/hooks/use-active-section";

export type TocItem = { id: string; label: string; depth: 0 | 1 };

// 노션식 떠 있는 목차. 평소에는 구간마다 짧은 선만 보이고, 마우스를 올리거나 키보드로 들어오면 제목 목록이 펼쳐진다.
// 본문(680px) 옆 여백이 충분한 1280px 이상에서만 보인다.
export function TocRail({ items }: { items: readonly TocItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));

  return (
    <nav
      aria-label="목차"
      className="group fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 xl:block"
    >
      <ul aria-hidden className="flex flex-col items-end gap-3 py-3 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
        {items.map((i) => (
          <li
            key={i.id}
            className={`h-0.5 rounded-full transition-colors ${i.depth ? "w-2.5" : "w-4"} ${i.id === active ? "bg-foreground" : "bg-border"}`}
          />
        ))}
      </ul>
      <ul className="pointer-events-none absolute right-0 top-1/2 w-64 -translate-y-1/2 rounded-xl border bg-background p-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={i.id === active ? "location" : undefined}
              className={`block rounded-md px-2 py-1.5 leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i.depth ? "pl-5" : ""} ${i.id === active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

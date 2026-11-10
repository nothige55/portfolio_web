"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

// 보이는 섹션을 따라 왼쪽 목차가 바뀐다.
export function SectionIndex({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState(items[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="섹션 목차" className="sticky top-24 hidden lg:block">
      <ol className="space-y-2 font-mono text-xs">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "true" : undefined}
              className="flex items-center gap-3 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:text-foreground"
            >
              <span
                aria-hidden
                className={`h-px bg-current transition-all duration-300 ${active === it.id ? "w-10" : "w-4"}`}
              />
              {String(i + 1).padStart(2, "0")} {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

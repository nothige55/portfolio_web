"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Entry = { id: string; path: readonly string[] };

// Trego의 breadcrumb 규칙을 페이지 자체에 쓴다: 현재 위치는 빼고 조상만 보여 준다.
export function PathBar({ name, entries }: { name: string; entries: readonly Entry[] }) {
  const [active, setActive] = useState(entries[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    entries.forEach((en) => {
      const el = document.getElementById(en.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [entries]);

  const path = entries.find((e) => e.id === active)?.path ?? [];
  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-11 max-w-[1100px] items-center gap-2 px-4 font-mono text-xs">
        <span className="font-semibold">{name}</span>
        {path.map((p) => (
          <span
            key={p}
            className="flex items-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300"
          >
            <span aria-hidden>›</span>
            {p}
          </span>
        ))}
        <nav aria-label="주요 메뉴" className="ml-auto flex gap-4 text-muted-foreground">
          <Link href="/dnd" className="hover:text-foreground">DnD</Link>
          <Link href="/about" className="hover:text-foreground">소개</Link>
        </nav>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveSection } from "@/hooks/use-active-section";

type Entry = { id: string; path: readonly string[] };

// Trego의 breadcrumb 규칙을 페이지 자체에 쓴다: 현재 위치는 빼고 조상만 보여 준다. 모든 페이지의 상단 막대다.
export function PathBar({ name, entries = [] }: { name: string; entries?: readonly Entry[] }) {
  const home = usePathname() === "/";
  const active = useActiveSection(entries.map((e) => e.id));

  const path = entries.find((e) => e.id === active)?.path ?? [];
  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-11 max-w-[1100px] items-center gap-2 px-4 font-mono text-xs">
        <Link href="/" className="font-semibold">
          {name}
        </Link>
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
          <Link href="/trego" className="hover:text-primary">Trego</Link>
          <Link
            href="/#about"
            className="hover:text-primary"
            onClick={(e) => {
              // 홈에서는 주소(해시)를 바꾸지 않고 스크롤만 한다. 다른 페이지는 링크 이동 후 HashScroll이 맞춘다.
              if (!home) return;
              e.preventDefault();
              const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("about")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
            }}
          >
            소개
          </Link>
        </nav>
      </div>
    </div>
  );
}

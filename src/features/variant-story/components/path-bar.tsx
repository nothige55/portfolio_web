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
    <div className="fixed inset-x-0 top-0 z-30 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
      <div className="mx-auto flex h-11 max-w-[1100px] items-center gap-2 px-4 font-mono text-xs">
        <Link
          href="/"
          className="font-semibold"
          onClick={(e) => {
            // 홈에서 같은 경로 링크는 아무 일도 안 일어나므로 맨 위로 스크롤한다.
            if (!home || e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
        >
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
          <Link href="/surgiauth" className="hover:text-primary">SurgiAuth</Link>
          <Link
            href="/#about"
            className="hover:text-primary"
            onClick={(e) => {
              // 홈에서는 주소(해시)를 바꾸지 않고 스크롤만 한다. 다른 페이지는 링크 이동 후 HashScroll이 맞춘다.
              if (!home || e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("about")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
            }}
          >
            연락하기
          </Link>
        </nav>
      </div>
    </div>
  );
}

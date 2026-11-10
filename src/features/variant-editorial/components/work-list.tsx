"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Work = { id: string; title: string; meta: string; blurb: string; href?: string };

// 목록 위에서 마우스를 따라다니는 미리보기 카드. 좌표는 state가 아니라 ref로 직접 옮긴다.
export function WorkList({ works }: { works: readonly Work[] }) {
  const [active, setActive] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const current = works.find((w) => w.id === active);

  function onMove(e: React.PointerEvent<HTMLUListElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    previewRef.current?.style.setProperty(
      "transform",
      `translate(${e.clientX - box.left + 16}px, ${e.clientY - box.top + 16}px)`,
    );
  }

  return (
    <ul
      className="relative divide-y divide-border border-y border-border"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      {works.map((w, i) => {
        const body = (
          <>
            <span className="w-8 font-mono text-xs tabular-nums text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 font-heading text-lg transition-transform duration-300 group-hover:translate-x-2 group-focus-visible:translate-x-2">
              {w.title}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">{w.meta}</span>
            <span
              aria-hidden
              className="ml-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          </>
        );
        const cls =
          "group flex items-center py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
        return (
          <li key={w.id} onPointerEnter={() => setActive(w.id)}>
            {w.href ? (
              <Link href={w.href} className={cls} onFocus={() => setActive(w.id)}>
                {body}
              </Link>
            ) : (
              <div className={cls} tabIndex={0} onFocus={() => setActive(w.id)}>
                {body}
              </div>
            )}
          </li>
        );
      })}
      <div
        ref={previewRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 z-10 hidden w-64 rounded-lg border border-border bg-card p-3 text-sm leading-relaxed shadow-md transition-opacity duration-200 md:block ${current ? "opacity-100" : "opacity-0"}`}
      >
        {current?.blurb}
      </div>
    </ul>
  );
}

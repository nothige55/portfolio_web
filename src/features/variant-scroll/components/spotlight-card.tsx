"use client";

import { useRef } from "react";

// 커서 위치를 CSS 변수로 넘겨 카드 안에서 빛이 따라다니게 한다.
export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty("--x", `${e.clientX - box.left}px`);
        ref.current?.style.setProperty("--y", `${e.clientY - box.top}px`);
      }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--x, 50%) var(--y, 50%), oklch(0.72 0.15 255 / 0.18), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

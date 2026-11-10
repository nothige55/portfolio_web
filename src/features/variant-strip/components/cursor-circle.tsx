"use client";

import { useRef } from "react";

// 마우스를 늦게 따라오는 원. 좌표는 state가 아니라 ref로 직접 옮긴다.
export function CursorCircle({ children }: { children: React.ReactNode }) {
  const dot = useRef<HTMLSpanElement>(null);
  return (
    <div
      className="relative h-full cursor-crosshair"
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        if (dot.current) {
          dot.current.style.transform = `translate(${e.clientX - box.left - 140}px, ${e.clientY - box.top - 140}px)`;
        }
      }}
    >
      <span
        ref={dot}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 hidden size-[280px] rounded-full bg-primary transition-transform duration-500 ease-out md:block"
        style={{ transform: "translate(300px, 60px)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

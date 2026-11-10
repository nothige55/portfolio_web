"use client";

import { useState } from "react";

const PITCH = 60; // 행 높이 52 + 간격 8
const initial = ["공항", "이호테우", "협재해수욕장", "동문시장"];
const goal = ["공항", "동문시장", "이호테우", "협재해수욕장"];

type Drag = { label: string; from: number; startY: number; dy: number };

function move<T>(list: readonly T[], from: number, to: number) {
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function SortableDemo() {
  const [order, setOrder] = useState(initial);
  const [drag, setDrag] = useState<Drag | null>(null);
  const last = order.length - 1;

  const over = drag
    ? Math.min(last, Math.max(0, Math.round((drag.from * PITCH + drag.dy) / PITCH)))
    : null;
  const shown = drag && over !== null ? move(order, drag.from, over) : order;
  const done = shown.join() === goal.join();

  function end() {
    if (drag && over !== null) setOrder(shown);
    setDrag(null);
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : null;
    if (to === null || to < 0 || to > last) return;
    e.preventDefault();
    setOrder(move(order, i, to));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        8/14의 <b className="text-foreground">동문시장</b>을 공항과 이호테우 사이로 옮겨 보세요.
      </p>
      <div className="relative" style={{ height: order.length * PITCH - 8 }}>
        {over !== null && (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[52px] rounded-lg border-2 border-dashed border-primary/60 bg-primary/5 transition-transform duration-200"
            style={{ transform: `translateY(${over * PITCH}px)` }}
          />
        )}
        {order.map((label, i) => {
          const dragging = drag !== null && drag.label === label;
          const y = dragging
            ? Math.min(last * PITCH, Math.max(0, drag.from * PITCH + drag.dy))
            : shown.indexOf(label) * PITCH;
          return (
            <div
              key={label}
              tabIndex={0}
              role="listitem"
              aria-label={`${label}, ${i + 1}번째. 위아래 화살표로 옮겨요`}
              onKeyDown={(e) => onKey(e, i)}
              className={`absolute inset-x-0 top-0 flex h-[52px] items-center gap-3 rounded-lg border bg-card px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${dragging ? "z-10 shadow-lg" : "transition-transform duration-200"}`}
              style={{ transform: `translateY(${y}px)${dragging ? " scale(1.03)" : ""}` }}
            >
              <span
                aria-hidden
                className="cursor-grab touch-none select-none px-1 text-muted-foreground active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ label, from: i, startY: e.clientY, dy: 0 });
                }}
                onPointerMove={(e) => drag && setDrag({ ...drag, dy: e.clientY - drag.startY })}
                onPointerUp={end}
                onPointerCancel={() => setDrag(null)}
              >
                ⋮⋮
              </span>
              <span className="text-sm">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-sm" aria-live="polite">
        <span className={done ? "font-medium text-primary" : "text-muted-foreground"}>
          {done ? "붙었어요 ✓" : "놓을 자리가 점선으로 열려요"}
        </span>
        <button
          type="button"
          onClick={() => setOrder(initial)}
          className="rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          처음으로
        </button>
      </div>
    </div>
  );
}

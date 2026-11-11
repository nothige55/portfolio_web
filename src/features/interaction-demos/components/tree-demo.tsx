"use client";

import { useEffect, useState } from "react";
import {
  applyDrop,
  INDENT,
  initialRows,
  locate,
  moveByKey,
  placesInOrder,
  resolveByDepth,
  resolveInside,
  type Resolved,
  type Row,
  type StepMode,
} from "../utils/tree-drop";

const ROW_H = 36;
const goal = ["공항", "동문시장", "이호테우", "협재해수욕장"];
const hints: Record<StepMode, string> = {
  line: "놓일 곳을 선으로 알려줘요",
  magnet: "놓을 수 있는 자리가 열려요",
  fill: "머물면 채워지고, 차면 안으로 들어가요",
};

// 지도(JejuMap)의 preview 속성과 같은 모양.
export type Preview = { order: string[]; label: string };

type Props = {
  mode: StepMode;
  rows: readonly Row[];
  onRowsChange: (rows: Row[]) => void;
  onPreview: (preview: Preview | null) => void;
};

type Drag = { id: string; x: number; y: number };

export function TreeDemo({ mode, rows, onRowsChange, onPreview }: Props) {
  const [drag, setDrag] = useState<Drag | null>(null);

  const located = drag ? locate(rows, drag.y, ROW_H) : null;
  let resolved: Resolved | null = null;
  if (drag && located) {
    resolved =
      located.kind === "inside"
        ? resolveInside(rows, drag.id, located.id)
        : resolveByDepth(rows, drag.id, located.afterId, drag.x / INDENT);
  }
  const dragLabel = drag ? rows.find((r) => r.id === drag.id)?.label : undefined;
  const next = drag && resolved?.valid ? applyDrop(rows, drag.id, resolved.target) : null;
  const previewKey = next && dragLabel ? `${dragLabel}|${placesInOrder(next).join()}` : "";

  useEffect(() => {
    if (!previewKey) return onPreview(null);
    const [label, order] = previewKey.split("|");
    onPreview({ label, order: order.split(",") });
  }, [previewKey, onPreview]);

  function pointAt(e: React.PointerEvent) {
    const box = e.currentTarget.closest("[data-tree]")!.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  }

  function end() {
    if (next) onRowsChange(next);
    setDrag(null);
  }

  function onKey(e: React.KeyboardEvent, id: string) {
    if (!e.key.startsWith("Arrow")) return;
    const moved = moveByKey(rows, id, e.key as "ArrowUp");
    if (!moved) return;
    e.preventDefault();
    onRowsChange(moved);
  }

  const done = placesInOrder(rows).join() === goal.join();
  const afterIdx = located?.kind === "slot" ? rows.findIndex((r) => r.id === located.afterId) : -1;
  const bad = resolved && !resolved.valid;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        8/14의 <b className="text-foreground">동문시장</b>을 공항과 이호테우 사이로 옮겨 보세요.
      </p>
      <div data-tree role="list" className="relative" style={{ height: rows.length * ROW_H }}>
        {rows.map((row, i) => {
          const isPlace = row.kind === "place";
          const dragging = drag?.id === row.id;
          const inside = located?.kind === "inside" && located.id === row.id && resolved !== null;
          const parent = [...rows.slice(0, i)].reverse().find((r) => r.depth === row.depth - 1);
          return (
            <div
              key={row.id}
              role="listitem"
              tabIndex={isPlace ? 0 : undefined}
              aria-label={isPlace ? `${row.label}, ${parent?.label ?? ""} 안. 방향키로 옮겨요` : undefined}
              onKeyDown={isPlace ? (e) => onKey(e, row.id) : undefined}
              className={`flex select-none items-center gap-2 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${row.kind === "place" ? "" : "font-medium"} ${dragging ? "opacity-50" : ""} ${inside ? `outline-2 -outline-offset-2 ${bad ? "outline-destructive" : "outline-primary"}` : ""}`}
              style={{ height: ROW_H, paddingLeft: row.depth * INDENT + 4 }}
            >
              {isPlace ? (
                <span
                  aria-hidden
                  className="cursor-grab touch-none px-1 text-muted-foreground active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDrag({ id: row.id, ...pointAt(e) });
                  }}
                  onPointerMove={(e) => drag && setDrag({ id: drag.id, ...pointAt(e) })}
                  onPointerUp={end}
                  onPointerCancel={() => setDrag(null)}
                >
                  ⋮⋮
                </span>
              ) : (
                <span aria-hidden className="px-1 text-muted-foreground">
                  {row.kind === "group" ? "▸" : "▾"}
                </span>
              )}
              <span>{row.label}</span>
            </div>
          );
        })}
        {resolved && located?.kind === "slot" && (
          <div
            aria-hidden
            className={`pointer-events-none absolute right-0 z-10 h-0.5 rounded ${bad ? "bg-destructive" : "bg-primary"}`}
            style={{ top: (afterIdx + 1) * ROW_H - 1, left: resolved.depth * INDENT + 4 }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-sm" aria-live="polite">
        <span className={done ? "font-medium text-primary" : "text-muted-foreground"}>
          {done ? "붙었어요 ✓" : hints[mode]}
        </span>
        <button
          type="button"
          onClick={() => onRowsChange([...initialRows])}
          className="rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          처음으로
        </button>
      </div>
    </div>
  );
}

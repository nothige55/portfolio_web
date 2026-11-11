"use client";

import { useEffect, useRef, useState } from "react";
import {
  allowedDepths,
  applyDrop,
  canDropInside,
  dropDepth,
  holdProgress,
  INDENT,
  initialRows,
  INSIDE_DELAY_MS,
  isOutsideTree,
  isWithinDeadZone,
  locate,
  locateSlot,
  moveByKey,
  placesInOrder,
  resolveByDepth,
  resolveInside,
  snapDepth,
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

// startX/startDepth: 끌기 시작 때 포인터 x와 행 깊이. 깊이는 여기서부터의 가로 이동량으로 정한다.
type Drag = { id: string; x: number; y: number; startX: number; startDepth: number };
// 컨테이너 가운데 구역에 머문 시작 시각. 지연이 지나야 안으로 붙는다.
type Hold = { id: string; since: number };
// 안으로 붙은 순간의 포인터 위치. 데드존 안에서는 그 판정을 유지한다(fill).
type Anchor = { id: string; x: number; y: number };

export function TreeDemo({ mode, rows, onRowsChange, onPreview }: Props) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [now, setNow] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const tree = useRef<HTMLDivElement>(null);
  const refocus = useRef<string | null>(null);

  // 행 순서가 바뀌면 DOM 노드가 다시 꽂혀 포커스가 사라지므로, 방향키로 옮긴 행에 포커스를 돌려준다.
  useEffect(() => {
    if (!refocus.current) return;
    tree.current?.querySelector<HTMLElement>(`[data-id="${refocus.current}"]`)?.focus();
    refocus.current = null;
  }, [rows]);

  // 머무는 동안 시간을 흘려 보낸다.
  useEffect(() => {
    if (!hold) return;
    let raf = requestAnimationFrame(function tick(t) {
      setNow(t);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [hold]);

  // 포인터 위치에서 놓일 곳을 정한다. 위치 판정은 항상 끌기 전 배치(rows) 기준이라 미리보기가 움직여도 되먹임이 없다.
  function decide(d: Drag, p: { x: number; y: number }, isHeld: (containerId: string) => boolean) {
    const id = d.id;
    const depth = dropDepth(d.startDepth, d.startX, p.x);
    const box = tree.current?.getBoundingClientRect();
    if (box && isOutsideTree(p, box.width, box.height)) return { located: null, resolved: null, slotAfter: null, held: false };
    const lockedId = mode === "fill" && anchor && isWithinDeadZone(anchor, p) ? anchor.id : null;
    const located = lockedId ? ({ kind: "inside", id: lockedId } as const) : locate(rows, p.y, ROW_H);
    let resolved: Resolved | null = null;
    let slotAfter: string | null = null;
    if (!located) return { located, resolved, slotAfter, held: false };
    const held = located.kind === "inside" && (lockedId !== null || isHeld(located.id));
    if (mode === "line") {
      resolved =
        located.kind === "inside"
          ? resolveInside(rows, id, located.id)
          : resolveByDepth(rows, id, located.afterId, depth);
      slotAfter = located.kind === "slot" ? located.afterId : null;
    } else if (held) {
      resolved = resolveInside(rows, id, located.id);
    } else {
      const slot = located.kind === "slot" ? located : locateSlot(rows, p.y, ROW_H);
      slotAfter = slot?.afterId ?? null;
      resolved = slot ? snapDepth(rows, id, slot.afterId, depth) : null;
    }
    return { located, resolved, slotAfter, held };
  }

  const elapsed = hold ? Math.max(0, now - hold.since) : 0;
  const { located, resolved, slotAfter, held } = drag
    ? decide(drag, drag, (cid) => hold?.id === cid && canDropInside(elapsed, INSIDE_DELAY_MS[mode]))
    : { located: null, resolved: null, slotAfter: null, held: false };
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

  function move(e: React.PointerEvent, d: Drag) {
    const p = pointAt(e);
    setDrag({ ...d, ...p });
    if (mode === "fill") {
      const r = decide(d, p, (cid) => hold?.id === cid && canDropInside(e.timeStamp - hold.since, INSIDE_DELAY_MS[mode]));
      if (!r.held || r.located?.kind !== "inside") setAnchor(null);
      else if (anchor?.id !== r.located.id) setAnchor({ id: r.located.id, x: d.x, y: d.y });
    }
    // 데드존 안에서는 붙은 판정을 유지하므로 머무름도 건드리지 않는다.
    if (mode === "fill" && anchor && isWithinDeadZone(anchor, p)) return;
    const at = locate(rows, p.y, ROW_H);
    const id2 = at?.kind === "inside" ? at.id : null;
    if (id2 === null) setHold(null);
    else if (hold?.id !== id2) {
      setHold({ id: id2, since: e.timeStamp });
      setNow(e.timeStamp);
    }
  }

  function stop() {
    setDrag(null);
    setHold(null);
    setAnchor(null);
  }

  // 마지막 move가 아직 그려지지 않았을 수 있어, 놓는 순간의 좌표로 다시 판정한다.
  function end(e: React.PointerEvent) {
    if (drag) {
      const r = decide(drag, pointAt(e), (cid) => hold?.id === cid && canDropInside(e.timeStamp - hold.since, INSIDE_DELAY_MS[mode])).resolved;
      if (r?.valid) onRowsChange(applyDrop(rows, drag.id, r.target));
    }
    stop();
  }

  function onKey(e: React.KeyboardEvent, id: string) {
    if (!e.key.startsWith("Arrow")) return;
    const moved = moveByKey(rows, id, e.key as "ArrowUp");
    if (!moved) return;
    e.preventDefault();
    refocus.current = id;
    onRowsChange(moved);
  }

  const done = placesInOrder(rows).join() === goal.join();
  const bad = resolved && !resolved.valid;
  const magnet = mode !== "line";
  // magnet/fill은 미리보기 배치(next)대로 행을 옮겨 그린다.
  const shown = magnet && next ? next : rows;
  const afterIdx = slotAfter ? rows.findIndex((r) => r.id === slotAfter) : -1;
  const ticks = magnet && drag && slotAfter ? allowedDepths(rows, drag.id, slotAfter) : [];
  const dragAt = drag ? shown.findIndex((r) => r.id === drag.id) : -1;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        8/14의 <b className="text-foreground">동문시장</b>을 공항과 이호테우 사이로 옮겨 보세요.
      </p>
      <div ref={tree} data-tree role="list" className="relative" style={{ height: rows.length * ROW_H }}>
        {rows.map((orig) => {
          // DOM 순서는 rows 그대로 두고 화면 위치만 옮긴다. 노드를 옮기면 끄는 중인 포인터 캡처가 풀린다.
          const i = shown.findIndex((r) => r.id === orig.id);
          const row = shown[i];
          const isPlace = row.kind === "place";
          const dragging = drag?.id === row.id;
          const inside = (mode === "line" ? located?.kind === "inside" : held) && located?.kind === "inside" && located.id === row.id && resolved !== null;
          const preview = magnet && dragging && next !== null;
          const parent = [...shown.slice(0, i)].reverse().find((r) => r.depth === row.depth - 1);
          return (
            <div
              key={row.id}
              data-id={row.id}
              role="listitem"
              tabIndex={isPlace ? 0 : undefined}
              aria-label={isPlace ? `${row.label}, ${parent?.label ?? ""} 안. 방향키로 옮겨요` : undefined}
              onKeyDown={isPlace ? (e) => onKey(e, row.id) : undefined}
              className={`absolute inset-x-0 top-0 flex select-none items-center gap-2 rounded-md text-sm motion-safe:transition-transform motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${row.kind === "place" ? "" : "font-medium"} ${dragging ? (preview ? "border border-dashed border-primary/60 bg-sky-100/70 dark:bg-sky-950/40" : "opacity-50") : ""} ${inside ? `outline-2 -outline-offset-2 ${bad ? "outline-destructive" : "outline-primary"}` : ""}`}
              style={{ height: ROW_H, paddingLeft: row.depth * INDENT + 4, transform: `translateY(${i * ROW_H}px)` }}
            >
              {isPlace ? (
                <span
                  aria-hidden
                  className="cursor-grab touch-none px-1 text-muted-foreground active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    {
                      const p = pointAt(e);
                      setDrag({ id: row.id, ...p, startX: p.x, startDepth: row.depth });
                    }
                  }}
                  onPointerMove={(e) => drag && move(e, drag)}
                  onPointerUp={end}
                  onPointerCancel={stop}
                  onLostPointerCapture={stop}
                >
                  ⋮⋮
                </span>
              ) : (
                <span aria-hidden className="px-1 text-muted-foreground">
                  {row.kind === "group" ? "▸" : "▾"}
                </span>
              )}
              <span>{row.label}</span>
              {mode === "fill" && located?.kind === "inside" && !held && hold?.id === row.id && located.id === row.id && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-md bg-primary/20"
                  style={{ width: `${holdProgress(elapsed, INSIDE_DELAY_MS.fill) * 100}%` }}
                />
              )}
            </div>
          );
        })}
        {mode === "line" && resolved && located?.kind === "slot" && (
          <div
            aria-hidden
            className={`pointer-events-none absolute right-0 z-10 h-0.5 rounded ${bad ? "bg-destructive" : "bg-primary"}`}
            style={{ top: (afterIdx + 1) * ROW_H - 1, left: resolved.depth * INDENT + 4 }}
          />
        )}
        {ticks.map((d) => (
          <div
            key={d}
            aria-hidden
            className={`pointer-events-none absolute w-0 border-l ${d === resolved?.depth ? "border-l-2 border-primary" : "border-dashed border-muted-foreground/50"}`}
            style={{ top: dragAt * ROW_H + 4, height: ROW_H - 8, left: d * INDENT - 2 }}
          />
        ))}
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

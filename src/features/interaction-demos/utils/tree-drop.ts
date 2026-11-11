// 트리 드래그의 드롭 규칙. UI와 무관한 순수 함수만 둔다.
export type Kind = "folder" | "day" | "group" | "place";
export type Row = { id: string; kind: Kind; label: string; depth: number };
export type StepMode = "line" | "magnet" | "fill";
// index는 끄는 행을 뺀 부모의 자식 목록에서의 위치.
export type Target = { parentId: string; index: number };
export type Resolved = { target: Target; depth: number; valid: boolean };
export type Located = { kind: "inside"; id: string } | { kind: "slot"; afterId: string };

export const INDENT = 22;

export const initialRows: readonly Row[] = [
  { id: "folder", kind: "folder", label: "제주 여행", depth: 0 },
  { id: "day1", kind: "day", label: "1일차", depth: 1 },
  { id: "airport", kind: "place", label: "공항", depth: 2 },
  { id: "coast", kind: "group", label: "해안 코스", depth: 2 },
  { id: "iho", kind: "place", label: "이호테우", depth: 3 },
  { id: "hyeopjae", kind: "place", label: "협재해수욕장", depth: 3 },
  { id: "dongmun", kind: "place", label: "동문시장", depth: 2 },
  { id: "day2", kind: "day", label: "2일차", depth: 1 },
];

const CHILD_KINDS: Record<Kind, readonly Kind[]> = {
  folder: ["day"],
  day: ["group", "place"],
  group: ["place"],
  place: [],
};

export function canContain(parent: Kind, child: Kind): boolean {
  return CHILD_KINDS[parent].includes(child);
}

const isContainer = (k: Kind) => CHILD_KINDS[k].length > 0;

export function locate(rows: readonly Row[], y: number, rowHeight: number): Located | null {
  if (y < 0 || rows.length === 0) return null;
  const i = Math.floor(y / rowHeight);
  if (i >= rows.length) return { kind: "slot", afterId: rows[rows.length - 1].id };
  const f = (y - i * rowHeight) / rowHeight;
  if (isContainer(rows[i].kind) && f >= 0.25 && f <= 0.75) return { kind: "inside", id: rows[i].id };
  if (f < 0.5) return i === 0 ? null : { kind: "slot", afterId: rows[i - 1].id };
  return { kind: "slot", afterId: rows[i].id };
}

type Slot = { rest: Row[]; i: number; min: number; max: number };

// 끄는 행을 뺀 목록과, afterId 행 뒤 슬롯의 깊이 범위. afterId가 끄는 행이면 그 바로 앞 행 뒤로 본다.
function slotOf(rows: readonly Row[], dragId: string, afterId: string): Slot | null {
  const rest = rows.filter((r) => r.id !== dragId);
  let id = afterId;
  if (afterId === dragId) {
    const at = rows.findIndex((r) => r.id === dragId);
    if (at < 1) return null;
    id = rows[at - 1].id;
  }
  const i = rest.findIndex((r) => r.id === id);
  if (i < 0) return null;
  const after = rest[i];
  return { rest, i, max: after.depth + (isContainer(after.kind) ? 1 : 0), min: rest[i + 1]?.depth ?? 1 };
}

function parentAt(rest: readonly Row[], i: number, depth: number): number {
  for (let j = i; j >= 0; j--) if (rest[j].depth === depth - 1) return j;
  return -1;
}

function childIndexes(rest: readonly Row[], parentIdx: number): number[] {
  const parent = rest[parentIdx];
  const out: number[] = [];
  for (let j = parentIdx + 1; j < rest.length && rest[j].depth > parent.depth; j++) {
    if (rest[j].depth === parent.depth + 1) out.push(j);
  }
  return out;
}

export function allowedDepths(rows: readonly Row[], dragId: string, afterId: string): number[] {
  const s = slotOf(rows, dragId, afterId);
  if (!s) return [];
  const out: number[] = [];
  for (let d = s.min; d <= s.max; d++) {
    const p = parentAt(s.rest, s.i, d);
    if (p >= 0 && canContain(s.rest[p].kind, "place")) out.push(d);
  }
  return out;
}

export function resolveByDepth(rows: readonly Row[], dragId: string, afterId: string, depth: number): Resolved | null {
  const s = slotOf(rows, dragId, afterId);
  if (!s) return null;
  const d = Math.min(s.max, Math.max(s.min, Math.round(depth)));
  const p = parentAt(s.rest, s.i, d);
  if (p < 0) return null;
  const index = childIndexes(s.rest, p).filter((j) => j <= s.i).length;
  return { target: { parentId: s.rest[p].id, index }, depth: d, valid: canContain(s.rest[p].kind, "place") };
}

export function resolveInside(rows: readonly Row[], dragId: string, containerId: string): Resolved | null {
  const rest = rows.filter((r) => r.id !== dragId);
  const p = rest.findIndex((r) => r.id === containerId);
  if (p < 0 || !isContainer(rest[p].kind)) return null;
  return {
    target: { parentId: containerId, index: childIndexes(rest, p).length },
    depth: rest[p].depth + 1,
    valid: canContain(rest[p].kind, "place"),
  };
}

export function applyDrop(rows: readonly Row[], dragId: string, target: Target): Row[] {
  const dragged = rows.find((r) => r.id === dragId);
  const rest = rows.filter((r) => r.id !== dragId);
  const p = rest.findIndex((r) => r.id === target.parentId);
  if (!dragged || p < 0) return [...rows];
  const kids = childIndexes(rest, p);
  let at: number;
  if (target.index < kids.length) at = kids[target.index];
  else {
    at = p + 1;
    while (at < rest.length && rest[at].depth > rest[p].depth) at++;
  }
  return [...rest.slice(0, at), { ...dragged, depth: rest[p].depth + 1 }, ...rest.slice(at)];
}

export function placesInOrder(rows: readonly Row[]): string[] {
  return rows.filter((r) => r.kind === "place").map((r) => r.label);
}

export function snapDepth(rows: readonly Row[], dragId: string, afterId: string, depth: number): Resolved | null {
  const allowed = allowedDepths(rows, dragId, afterId);
  if (allowed.length === 0) return null;
  const best = allowed.reduce((a, b) => {
    const da = Math.abs(a - depth);
    const db = Math.abs(b - depth);
    return db < da || (db === da && b > a) ? b : a;
  });
  return resolveByDepth(rows, dragId, afterId, best);
}

export const INSIDE_DELAY_MS: Record<StepMode, number> = { line: 0, magnet: 500, fill: 1000 };

export function holdProgress(elapsedMs: number, delayMs: number): number {
  if (delayMs <= 0) return 1;
  return Math.min(1, Math.max(0, elapsedMs / delayMs));
}

export const canDropInside = (elapsedMs: number, delayMs: number) => holdProgress(elapsedMs, delayMs) >= 1;

export const DEAD_ZONE_PX = 7.5;

type Point = { x: number; y: number };

export function isWithinDeadZone(anchor: Point | null, point: Point): boolean {
  return anchor !== null && Math.hypot(anchor.x - point.x, anchor.y - point.y) < DEAD_ZONE_PX;
}

export function moveByKey(
  rows: readonly Row[],
  dragId: string,
  key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
): Row[] | null {
  const drag = rows.find((r) => r.id === dragId);
  const at = rows.findIndex((r) => r.id === dragId);
  if (!drag || at < 1) return null;
  const rest = rows.filter((r) => r.id !== dragId);
  const apply = (r: Resolved | null) => (r && r.valid ? applyDrop(rows, dragId, r.target) : null);

  if (key === "ArrowLeft" || key === "ArrowRight") {
    const depths = allowedDepths(rows, dragId, dragId);
    const next = key === "ArrowLeft" ? Math.max(...depths.filter((d) => d < drag.depth)) : Math.min(...depths.filter((d) => d > drag.depth));
    return Number.isFinite(next) ? apply(resolveByDepth(rows, dragId, dragId, next)) : null;
  }

  const step = key === "ArrowUp" ? -1 : 1;
  for (let j = at - 1 + step; j >= 0 && j < rest.length; j += step) {
    const depths = allowedDepths(rows, dragId, rest[j].id);
    if (depths.length) return apply(resolveByDepth(rows, dragId, rest[j].id, Math.max(...depths)));
  }
  return null;
}

// locate와 같지만 컨테이너 가운데 구역(inside)도 f < 0.5 / 그 이상으로 나눈 슬롯으로 돌려준다.
export function locateSlot(rows: readonly Row[], y: number, rowHeight: number): Extract<Located, { kind: "slot" }> | null {
  if (y < 0 || rows.length === 0) return null;
  const i = Math.floor(y / rowHeight);
  if (i >= rows.length) return { kind: "slot", afterId: rows[rows.length - 1].id };
  if (y - i * rowHeight < rowHeight / 2) return i === 0 ? null : { kind: "slot", afterId: rows[i - 1].id };
  return { kind: "slot", afterId: rows[i].id };
}

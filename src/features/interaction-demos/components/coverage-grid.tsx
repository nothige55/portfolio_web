"use client";

import { useEffect, useState } from "react";

// SurgiAuth 가입 화면의 수집 규칙을 마우스로 흉내 낸 데모. 카메라는 쓰지 않는다.
// 값은 SurgiAuth hand-orientation.ts와 같다: roll ±25°(칸 폭 10°)·pitch ±27°(칸 폭 18°)의 5×3 격자.
// 격자 밖은 가장자리 칸으로 몰리고, open_palm 인식이 풀리는 각도(roll ±54°·pitch ±30° 밖)에서는 담지 않는다.
const ROLL_COLS = 5;
const PITCH_ROWS = 3;
const ROLL_RANGE = 50;
const PITCH_RANGE = 54;
const ROLL_LIMIT = 54;
const PITCH_LIMIT = 30;
const PER_CELL = 2;
const TOTAL = ROLL_COLS * PITCH_ROWS * PER_CELL;
// 패드가 보여 주는 각도 범위(격자보다 넓다).
const PAD_ROLL = 60;
const PAD_PITCH = 35;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const bucket = (v: number, range: number, count: number) =>
  clamp(Math.floor(((v + range / 2) / range) * count), 0, count - 1);

type Angle = { roll: number; pitch: number };

function judge({ roll, pitch }: Angle) {
  if (Math.abs(roll) > ROLL_LIMIT || Math.abs(pitch) > PITCH_LIMIT) {
    return { kind: "lost" as const, key: "" };
  }
  const r = bucket(roll, ROLL_RANGE, ROLL_COLS);
  const p = bucket(pitch, PITCH_RANGE, PITCH_ROWS);
  const clamped = Math.abs(roll) > ROLL_RANGE / 2 || Math.abs(pitch) > PITCH_RANGE / 2;
  return { kind: clamped ? ("edge" as const) : ("ok" as const), key: `${p}-${r}` };
}

export function CoverageGrid() {
  const [angle, setAngle] = useState<Angle>({ roll: 0, pitch: 0 });
  const [engaged, setEngaged] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const verdict = judge(angle);
  const collecting = engaged && verdict.kind !== "lost";
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // 한 자리에 머무르면 0.5초마다 한 장씩 담는다. 인식이 풀린 각도에서는 담지 않는다.
  useEffect(() => {
    if (!collecting) return;
    const key = verdict.key;
    const id = setInterval(() => {
      setCounts((c) => ((c[key] ?? 0) >= PER_CELL ? c : { ...c, [key]: (c[key] ?? 0) + 1 }));
    }, 500);
    return () => clearInterval(id);
  }, [collecting, verdict.key]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    setEngaged(true);
    setAngle({
      roll: clamp((((e.clientX - box.left) / box.width) - 0.5) * 2 * PAD_ROLL, -PAD_ROLL, PAD_ROLL),
      pitch: clamp((0.5 - (e.clientY - box.top) / box.height) * 2 * PAD_PITCH, -PAD_PITCH, PAD_PITCH),
    });
  }

  function onKey(e: React.KeyboardEvent) {
    const step = 5;
    const d: Record<string, Angle> = {
      ArrowLeft: { roll: -step, pitch: 0 },
      ArrowRight: { roll: step, pitch: 0 },
      ArrowUp: { roll: 0, pitch: step },
      ArrowDown: { roll: 0, pitch: -step },
    };
    const move = d[e.key];
    if (!move) return;
    e.preventDefault();
    setEngaged(true);
    setAngle((a) => ({
      roll: clamp(a.roll + move.roll, -PAD_ROLL, PAD_ROLL),
      pitch: clamp(a.pitch + move.pitch, -PAD_PITCH, PAD_PITCH),
    }));
  }

  const pct = (v: number, range: number) => ((v + range) / (2 * range)) * 100;
  const gridLeft = pct(-ROLL_RANGE / 2, PAD_ROLL);
  const gridTop = 100 - pct(PITCH_RANGE / 2, PAD_PITCH);

  const message = !engaged
    ? "패드 위에 마우스를 올려 손을 기울여 보세요"
    : verdict.kind === "lost"
      ? "open_palm 인식이 풀리는 각도예요. 이 프레임은 담지 않아요"
      : (counts[verdict.key] ?? 0) >= PER_CELL
        ? "이 칸은 찼어요. 다른 각도로 옮겨 보세요"
        : verdict.kind === "edge"
          ? "격자 밖이라 가장자리 칸에 담겨요. 머물러 보세요"
          : "머물면 한 장씩 담겨요";

  return (
    <div className="space-y-3">
      <div
        tabIndex={0}
        role="application"
        aria-label="손 각도 패드. 화살표 키로 roll과 pitch를 바꿔요"
        onPointerMove={onMove}
        onKeyDown={onKey}
        className="relative aspect-[480/280] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-lg border bg-[repeating-linear-gradient(135deg,transparent_0_6px,oklch(0.9_0_0)_6px_7px)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          aria-hidden
          className="absolute bg-card"
          style={{
            left: `${pct(-ROLL_LIMIT, PAD_ROLL)}%`,
            right: `${pct(-ROLL_LIMIT, PAD_ROLL)}%`,
            top: `${100 - pct(PITCH_LIMIT, PAD_PITCH)}%`,
            bottom: `${100 - pct(PITCH_LIMIT, PAD_PITCH)}%`,
          }}
        />
        <div
          className="absolute grid grid-cols-5 grid-rows-3 border border-foreground/30"
          style={{ left: `${gridLeft}%`, right: `${gridLeft}%`, top: `${gridTop}%`, bottom: `${gridTop}%` }}
        >
          {Array.from({ length: ROLL_COLS * PITCH_ROWS }, (_, i) => {
            const row = Math.floor(i / ROLL_COLS);
            const p = PITCH_ROWS - 1 - row; // 위쪽 줄이 pitch가 큰 칸
            const r = i % ROLL_COLS;
            const key = `${p}-${r}`;
            const n = counts[key] ?? 0;
            const here = collecting && verdict.key === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-center gap-1 border border-foreground/10 transition-colors ${n >= PER_CELL ? "bg-primary/20" : ""} ${here ? "ring-2 ring-inset ring-primary" : ""}`}
              >
                {Array.from({ length: PER_CELL }, (_, d) => (
                  <span key={d} className={`size-1.5 rounded-full ${d < n ? "bg-primary" : "bg-foreground/15"}`} />
                ))}
              </div>
            );
          })}
        </div>
        {engaged && (
          <span
            aria-hidden
            className={`pointer-events-none absolute text-2xl transition-opacity ${verdict.kind === "lost" ? "opacity-30 grayscale" : ""}`}
            style={{
              left: `${pct(angle.roll, PAD_ROLL)}%`,
              top: `${100 - pct(angle.pitch, PAD_PITCH)}%`,
              transform: `translate(-50%,-50%) rotate(${angle.roll}deg) scaleY(${Math.cos((angle.pitch * Math.PI) / 180)})`,
            }}
          >
            🖐
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
        <span className={total >= TOTAL ? "font-medium text-primary" : "text-muted-foreground"}>
          {total >= TOTAL ? "30장을 다 모았어요 ✓" : message}
        </span>
        <button
          type="button"
          onClick={() => setCounts({})}
          className="shrink-0 rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          비우기
        </button>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        roll {angle.roll.toFixed(0)}° · pitch {angle.pitch.toFixed(0)}° · {total} / {TOTAL}장
      </p>
    </div>
  );
}

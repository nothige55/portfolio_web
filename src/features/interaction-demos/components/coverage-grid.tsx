"use client";

import { useEffect, useRef, useState } from "react";

// SurgiAuth 가입 화면의 수집 규칙을 손 모델로 흉내 낸 데모. 카메라는 쓰지 않는다.
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
// 손잡이가 움직이는 각도 범위(인식 한계보다 조금 넓게 둬서 풀리는 구간을 보여 준다).
const SHOW_ROLL = 70;
const SHOW_PITCH = 45;

const C = 150;
const R_ROLL = 135;
const R_PITCH = 108;
const RAD = Math.PI / 180;

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

// roll은 위쪽에서 시계 방향, pitch는 오른쪽에서 위쪽 방향으로 잰다.
const rollPoint = (deg: number, r = R_ROLL) => [C + r * Math.sin(deg * RAD), C - r * Math.cos(deg * RAD)] as const;
const pitchPoint = (deg: number, r = R_PITCH) => [C + r * Math.cos(deg * RAD), C - r * Math.sin(deg * RAD)] as const;

function arc(point: (d: number) => readonly [number, number], from: number, to: number) {
  const [x0, y0] = point(from);
  const [x1, y1] = point(to);
  // 두 호 모두 한 번에 90° 미만이라 large-arc는 항상 0이다.
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${point === rollPoint ? R_ROLL : R_PITCH},${point === rollPoint ? R_ROLL : R_PITCH} 0 0 ${to > from ? 1 : 0} ${x1.toFixed(1)},${y1.toFixed(1)}`;
}

function Hand() {
  return (
    <svg viewBox="0 0 100 120" className="size-full" aria-hidden>
      <g fill="oklch(0.93 0.03 60)" stroke="oklch(0.35 0.03 60)" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="30" y="58" width="42" height="50" rx="14" />
        <rect x="30" y="24" width="9" height="44" rx="4.5" />
        <rect x="41" y="12" width="9" height="56" rx="4.5" />
        <rect x="52" y="20" width="9" height="48" rx="4.5" />
        <rect x="63" y="34" width="9" height="36" rx="4.5" />
        <rect x="10" y="66" width="9" height="34" rx="4.5" transform="rotate(-38 14 82)" />
      </g>
    </svg>
  );
}

export function CoverageGrid() {
  const [angle, setAngle] = useState<Angle>({ roll: 0, pitch: 0 });
  const [engaged, setEngaged] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const stage = useRef<HTMLDivElement>(null);
  // 휠은 손을 누르거나 포커스한 뒤에만 받는다. 그냥 지나가며 스크롤할 때 페이지를 붙잡지 않게 하려는 것.
  const [armed, setArmed] = useState(false);

  // 손 위에서 휠을 굴리면 기울어진다: 세로 휠은 pitch, 가로 휠(Shift+휠, 트랙패드 좌우)은 roll.
  // 끝까지 갔으면 페이지 스크롤로 넘겨서 화면이 갇히지 않게 한다.
  useEffect(() => {
    const el = stage.current;
    if (!el || !armed) return;
    function onWheel(e: WheelEvent) {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const next: Angle = horizontal
        ? { ...angle, roll: clamp(angle.roll + e.deltaX * 0.15, -SHOW_ROLL, SHOW_ROLL) }
        : { ...angle, pitch: clamp(angle.pitch - e.deltaY * 0.1, -SHOW_PITCH, SHOW_PITCH) };
      if (next.roll === angle.roll && next.pitch === angle.pitch) return;
      e.preventDefault();
      setEngaged(true);
      setAngle(next);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [angle, armed]);

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

  function local(e: React.PointerEvent) {
    const box = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
    const scale = 300 / box.width;
    return { x: (e.clientX - box.left) * scale - C, y: (e.clientY - box.top) * scale - C };
  }

  function drag(axis: "roll" | "pitch") {
    return {
      onPointerDown: (e: React.PointerEvent) => e.currentTarget.setPointerCapture(e.pointerId),
      onPointerMove: (e: React.PointerEvent) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const { x, y } = local(e);
        setEngaged(true);
        setAngle((a) =>
          axis === "roll"
            ? { ...a, roll: clamp(Math.atan2(x, -y) / RAD, -SHOW_ROLL, SHOW_ROLL) }
            : { ...a, pitch: clamp(Math.atan2(-y, x) / RAD, -SHOW_PITCH, SHOW_PITCH) },
        );
      },
    };
  }

  function key(axis: "roll" | "pitch") {
    return (e: React.KeyboardEvent) => {
      const dir = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      setEngaged(true);
      setAngle((a) =>
        axis === "roll"
          ? { ...a, roll: clamp(a.roll + dir * 5, -SHOW_ROLL, SHOW_ROLL) }
          : { ...a, pitch: clamp(a.pitch + dir * 5, -SHOW_PITCH, SHOW_PITCH) },
      );
    };
  }

  const [rx, ry] = rollPoint(angle.roll);
  const [px, py] = pitchPoint(angle.pitch);
  const lost = verdict.kind === "lost";
  const guide = "oklch(0.55 0 0 / 0.45)";
  const warn = "oklch(0.62 0.17 30 / 0.7)";

  const message = !engaged
    ? "손을 눌러 선택한 뒤 스크롤하거나 손잡이를 끌어 보세요"
    : lost
      ? "open_palm 인식이 풀리는 각도예요. 이 프레임은 담지 않아요"
      : (counts[verdict.key] ?? 0) >= PER_CELL
        ? "이 칸은 찼어요. 다른 각도로 옮겨 보세요"
        : verdict.kind === "edge"
          ? "격자 밖이라 가장자리 칸에 담겨요. 머물러 보세요"
          : "머물면 한 장씩 담겨요";

  return (
    <div className="space-y-4">
      <div
        ref={stage}
        className="relative mx-auto aspect-square w-full max-w-[300px]"
        onPointerDown={() => setArmed(true)}
        onPointerLeave={() => setArmed(false)}
        onFocus={() => setArmed(true)}
        onBlur={() => setArmed(false)}
      >
        <div
          className="absolute left-[30%] top-[27%] h-[46%] w-[40%] transition-opacity"
          style={{
            transform: `perspective(500px) rotateX(${angle.pitch}deg) rotateZ(${angle.roll}deg)`,
            opacity: lost ? 0.35 : 1,
            filter: lost ? "grayscale(1)" : undefined,
          }}
        >
          <Hand />
        </div>

        <svg viewBox="0 0 300 300" className="absolute inset-0 size-full touch-none select-none" role="group" aria-label="손 기울기 조절">
          {/* roll 호: 위쪽. 인식 한계 안은 실선, 밖은 점선 */}
          <path d={arc(rollPoint, -ROLL_LIMIT, ROLL_LIMIT)} fill="none" stroke={guide} strokeWidth="2" />
          <path d={arc(rollPoint, -SHOW_ROLL, -ROLL_LIMIT)} fill="none" stroke={warn} strokeWidth="2" strokeDasharray="3 3" />
          <path d={arc(rollPoint, ROLL_LIMIT, SHOW_ROLL)} fill="none" stroke={warn} strokeWidth="2" strokeDasharray="3 3" />
          {/* pitch 호: 오른쪽 */}
          <path d={arc(pitchPoint, -PITCH_LIMIT, PITCH_LIMIT)} fill="none" stroke={guide} strokeWidth="2" />
          <path d={arc(pitchPoint, -SHOW_PITCH, -PITCH_LIMIT)} fill="none" stroke={warn} strokeWidth="2" strokeDasharray="3 3" />
          <path d={arc(pitchPoint, PITCH_LIMIT, SHOW_PITCH)} fill="none" stroke={warn} strokeWidth="2" strokeDasharray="3 3" />
          {/* 칸 경계 눈금 */}
          {[-25, -15, -5, 5, 15, 25].map((d) => {
            const [a, b] = rollPoint(d, R_ROLL - 5);
            const [c, e] = rollPoint(d, R_ROLL + 5);
            return <line key={`r${d}`} x1={a} y1={b} x2={c} y2={e} stroke={guide} />;
          })}
          {[-27, -9, 9, 27].map((d) => {
            const [a, b] = pitchPoint(d, R_PITCH - 5);
            const [c, e] = pitchPoint(d, R_PITCH + 5);
            return <line key={`p${d}`} x1={a} y1={b} x2={c} y2={e} stroke={guide} />;
          })}
          <text x={C} y="12" textAnchor="middle" fontSize="10" fill="oklch(0.5 0 0)">roll</text>
          <text x="292" y={C + 3} textAnchor="end" fontSize="10" fill="oklch(0.5 0 0)">pitch</text>

          <circle
            cx={rx}
            cy={ry}
            r="10"
            tabIndex={0}
            role="slider"
            aria-label="roll"
            aria-valuemin={-70}
            aria-valuemax={70}
            aria-valuenow={Math.round(angle.roll)}
            className="cursor-grab fill-primary stroke-white outline-none focus-visible:stroke-foreground active:cursor-grabbing"
            strokeWidth="2.5"
            onKeyDown={key("roll")}
            {...drag("roll")}
          />
          <circle
            cx={px}
            cy={py}
            r="10"
            tabIndex={0}
            role="slider"
            aria-label="pitch"
            aria-valuemin={-45}
            aria-valuemax={45}
            aria-valuenow={Math.round(angle.pitch)}
            className="cursor-grab fill-primary stroke-white outline-none focus-visible:stroke-foreground active:cursor-grabbing"
            strokeWidth="2.5"
            onKeyDown={key("pitch")}
            {...drag("pitch")}
          />
        </svg>
      </div>

      <div className="mx-auto grid w-full max-w-[300px] grid-cols-5 grid-rows-3 border border-foreground/30" aria-label="수집 격자 5×3">
        {Array.from({ length: ROLL_COLS * PITCH_ROWS }, (_, i) => {
          const p = PITCH_ROWS - 1 - Math.floor(i / ROLL_COLS); // 위쪽 줄이 pitch가 큰 칸
          const k = `${p}-${i % ROLL_COLS}`;
          const n = counts[k] ?? 0;
          const here = collecting && verdict.key === k;
          return (
            <div
              key={k}
              className={`flex h-10 items-center justify-center gap-1 border border-foreground/10 transition-colors ${n >= PER_CELL ? "bg-primary/20" : ""} ${here ? "ring-2 ring-inset ring-primary" : ""}`}
            >
              {Array.from({ length: PER_CELL }, (_, d) => (
                <span key={d} className={`size-1.5 rounded-full ${d < n ? "bg-primary" : "bg-foreground/15"}`} />
              ))}
            </div>
          );
        })}
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

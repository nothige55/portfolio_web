"use client";

import { useEffect, useRef, useState } from "react";
import {
  handPosition,
  judge,
  PER_CELL,
  PITCH_ROWS,
  ROLL_COLS,
  ROLL_RANGE,
  PITCH_RANGE,
  tiltAngle,
  TOTAL,
  type Angle,
} from "../utils/hand-orientation";

function Hand() {
  return (
    <svg viewBox="0 0 100 120" className="size-full" aria-hidden>
      <g fill="oklch(0.93 0.03 60)" stroke="oklch(0.35 0.03 60)" strokeWidth="2.5" strokeLinejoin="round">
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

// 손이 격자 위에 올라가 있고, 기울이면 그 각도의 칸으로 옮겨 간다.
// 휠은 좌우가 roll, 위아래가 pitch다. 끝까지 가면 페이지 스크롤로 넘겨서 화면이 갇히지 않게 한다.
export function CoverageGrid() {
  const [angle, setAngle] = useState<Angle>({ roll: 0, pitch: 0 });
  const [engaged, setEngaged] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const stage = useRef<HTMLDivElement>(null);
  const angleRef = useRef(angle);
  // 포인터가 무대 위에서 실제로 움직였거나 포커스가 있을 때만 휠을 받는다. 스크롤하다 무대가 포인터 밑으로 들어온 것만으로는 받지 않는다.
  const wheelOn = useRef(false);
  // 끌기는 movementX/Y 대신 마지막 좌표와의 차이로 잰다. 터치에서 movement 값이 0으로 오는 브라우저가 있다.
  const lastDrag = useRef({ x: 0, y: 0 });
  // 끌 때 커서가 간 거리를 격자 크기로 환산하려고 쓴다. 그래야 손이 커서 밑에 머문다.
  const gridEl = useRef<HTMLDivElement>(null);

  function tilt(dRoll: number, dPitch: number) {
    const next = tiltAngle(angleRef.current, dRoll, dPitch);
    if (!next) return false;
    angleRef.current = next;
    setAngle(next);
    setEngaged(true);
    return true;
  }

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!wheelOn.current) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const moved = horizontal ? tilt(e.deltaX * 0.15, 0) : tilt(0, -e.deltaY * 0.1);
      // 가로 휠은 한계에서도 막는다. 넘기면 트랙패드 스와이프가 브라우저 뒤로 가기가 된다.
      if (moved || horizontal) e.preventDefault();
    }
    // 페이지가 스크롤됐다는 건 휠이 넘어갔다는 뜻이다. 포인터를 다시 움직이기 전까지는 받지 않는다.
    const disarm = () => (wheelOn.current = false);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", disarm, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", disarm);
    };
  }, []);

  const verdict = judge(angle);
  const lost = verdict.kind === "lost";
  const collecting = engaged && !lost;
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

  const pos = handPosition(angle);
  const here = (counts[verdict.key] ?? 0) >= PER_CELL;
  const message =
    total >= TOTAL
      ? "30장을 다 모았어요"
      : !engaged
        ? "손을 기울여 보세요"
        : lost
          ? "인식기가 먼저 걸러요. open palm 판정이 풀리는 각도라 담지 않아요"
          : here
            ? "이 칸은 찼어요. 다른 각도로 옮겨 보세요"
            : verdict.kind === "edge"
              ? "격자 밖이라 가장자리 칸에 담겨요"
              : "머물면 한 장씩 담겨요";

  function onKeyDown(e: React.KeyboardEvent) {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [-5, 0],
      ArrowRight: [5, 0],
      ArrowUp: [0, 5],
      ArrowDown: [0, -5],
    };
    const d = step[e.key];
    if (!d) return;
    e.preventDefault();
    tilt(d[0], d[1]);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        격자 위에서 스크롤하세요. 좌우는 roll, 위아래는 pitch예요.
      </p>
      <div
        ref={stage}
        tabIndex={0}
        role="group"
        aria-label="손 기울기. 방향키로 조절해요"
        className="rounded-lg px-10 py-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onPointerMove={(e) => {
          if (e.movementX || e.movementY) wheelOn.current = true;
        }}
        onPointerLeave={() => (wheelOn.current = false)}
        onFocus={() => (wheelOn.current = true)}
        onBlur={() => (wheelOn.current = false)}
        onKeyDown={onKeyDown}
      >
        <div className="relative mx-auto w-full max-w-[520px]">
          <div
            ref={gridEl}
            className="grid grid-cols-5 grid-rows-3 border border-foreground/25 bg-card"
            aria-label={`수집 격자 ${ROLL_COLS}×${PITCH_ROWS}`}
          >
            {Array.from({ length: ROLL_COLS * PITCH_ROWS }, (_, i) => {
              const p = PITCH_ROWS - 1 - Math.floor(i / ROLL_COLS); // 위쪽 줄이 pitch가 큰 칸
              const k = `${p}-${i % ROLL_COLS}`;
              const n = counts[k] ?? 0;
              const current = collecting && verdict.key === k;
              return (
                <div
                  key={k}
                  className={`flex h-14 items-end justify-center gap-1 border border-foreground/10 pb-2 motion-safe:transition-colors sm:h-20 ${n >= PER_CELL ? "bg-primary/15" : ""} ${current ? "ring-2 ring-inset ring-primary" : ""}`}
                >
                  {Array.from({ length: PER_CELL }, (_, d) => (
                    <span key={d} className={`size-1.5 rounded-full ${d < n ? "bg-primary" : "bg-foreground/15"}`} />
                  ))}
                </div>
              );
            })}
          </div>

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
          >
            <div
              className="w-11 cursor-grab touch-none select-none active:cursor-grabbing sm:w-14"
              style={{
                transform: `perspective(260px) rotateX(${angle.pitch}deg) rotateZ(${angle.roll}deg)`,
                opacity: lost ? 0.35 : 1,
                filter: lost ? "grayscale(1)" : undefined,
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                lastDrag.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                const { x, y } = lastDrag.current;
                lastDrag.current = { x: e.clientX, y: e.clientY };
                const box = gridEl.current?.getBoundingClientRect();
                if (!box) return;
                tilt(((e.clientX - x) * ROLL_RANGE) / box.width, (-(e.clientY - y) * PITCH_RANGE) / box.height);
              }}
            >
              <Hand />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
        <span className={total >= TOTAL ? "font-medium text-primary" : "text-muted-foreground"}>{message}</span>
        <button
          type="button"
          onClick={() => setCounts({})}
          className="shrink-0 rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          비우기
        </button>
      </div>
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        roll {angle.roll.toFixed(0)}° · pitch {angle.pitch.toFixed(0)}° · {total} / {TOTAL}장
      </p>
    </div>
  );
}

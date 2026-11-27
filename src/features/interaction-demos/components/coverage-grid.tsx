"use client";

import { Mouse } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DemoHint } from "@/components/ui/demo-hint";
import {
  clamp,
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

// 칸 색은 격자와 범례가 같은 클래스를 써야 어긋나지 않는다.
const CELL_EMPTY = "bg-foreground/[0.06]";
const CELL_ONE = "bg-[color-mix(in_srgb,#11d39b_22%,transparent)]";
const CELL_FULL = "bg-[color-mix(in_srgb,#11d39b_55%,transparent)]";

function Hand() {
  return (
    <svg viewBox="0 0 100 120" className="size-full" aria-hidden>
      <g
        fill="oklch(0.93 0.03 60)"
        stroke="oklch(0.35 0.03 60)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        <rect x="30" y="58" width="42" height="50" rx="14" />
        <rect x="30" y="24" width="9" height="44" rx="4.5" />
        <rect x="41" y="12" width="9" height="56" rx="4.5" />
        <rect x="52" y="20" width="9" height="48" rx="4.5" />
        <rect x="63" y="34" width="9" height="36" rx="4.5" />
        <rect
          x="10"
          y="66"
          width="9"
          height="34"
          rx="4.5"
          transform="rotate(-38 14 82)"
        />
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
  // 방금 담은 칸. 같은 칸에 연달아 담지 못하게 막는 데 쓴다.
  const [lastCaptured, setLastCaptured] = useState<string | null>(null);

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
      const moved = horizontal
        ? tilt(e.deltaX * 0.15, 0)
        : tilt(0, -e.deltaY * 0.1);
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

  const pos = handPosition(angle);
  const here = (counts[verdict.key] ?? 0) >= PER_CELL;
  const justCaptured = verdict.key === lastCaptured;

  // 한 칸에 머무르면 0.25초 뒤 한 장 담고, 다른 칸에 담기 전에는 같은 칸에 또 담지 않는다. 인식이 풀린 각도에서는 담지 않는다.
  useEffect(() => {
    if (!collecting || here || justCaptured) return;
    const key = verdict.key;
    const id = setTimeout(() => {
      setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }));
      setLastCaptured(key);
    }, 250);
    return () => clearTimeout(id);
  }, [collecting, here, justCaptured, verdict.key]);

  const message =
    total >= TOTAL
      ? "30장을 모두 모았습니다"
      : !engaged
        ? "손을 기울여 보세요"
        : lost
          ? "너무 기울어 손바닥으로 인식되지 않는 각도라 모으지 않습니다"
          : here
            ? "이 칸은 찼습니다. 다른 각도로 옮겨 보세요"
            : justCaptured
              ? "방금 담은 칸입니다. 다른 칸에 담은 뒤 다시 오세요"
              : verdict.kind === "edge"
                ? "격자 범위를 넘어 가장 가까운 가장자리 칸에 담깁니다"
                : "이 각도에 머물면 한 장씩 담깁니다";

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
      <div>
        <p className="font-mono text-sm text-project-ink">수집 화면 데모</p>
        <h3 className="mt-1 text-xl font-semibold lg:text-2xl">
          손을 기울여 빈 칸을 채워 보세요
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          실제 앱은 카메라로 손의 각도를 읽습니다. 여기서는 격자 위에서 휠을
          굴리거나 손을 끌어 기울입니다. 같은 칸에는 연달아 담기지 않고, 좌우
          54°·위아래 30°를 넘게 기울면 손바닥으로 인식되지 않아 담기지 않습니다.
        </p>
      </div>
      <div className="rounded-2xl bg-card ring-1 ring-black/5 shadow-[0_40px_100px_-40px_color-mix(in_srgb,var(--project)_55%,transparent)]">
        <div
          aria-hidden="true"
          className="relative flex h-9 items-center rounded-t-2xl border-b border-border/60 bg-muted/40 px-4"
        >
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="absolute inset-x-0 text-center text-xs text-muted-foreground">
            SurgiAuth — 손 등록
          </span>
        </div>
        <div className="flex items-center justify-between px-4 pt-3 text-sm">
          <span className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${collecting ? "bg-[#11d39b]" : "bg-foreground/25"}`}
            />
            <span
              className={
                total >= TOTAL || collecting
                  ? "font-medium"
                  : "text-muted-foreground"
              }
            >
              {total >= TOTAL
                ? "완료"
                : collecting
                  ? "수집 중"
                  : lost
                    ? "인식 안 됨"
                    : "대기"}
            </span>
          </span>
          <span className="font-mono font-semibold tabular-nums">
            {total} / {TOTAL}
          </span>
        </div>
        <div
          ref={stage}
          tabIndex={0}
          role="group"
          aria-label="손 기울기. 방향키로 조절합니다"
          className="rounded-lg px-6 py-6 sm:px-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onPointerMove={(e) => {
            if (e.movementX || e.movementY) wheelOn.current = true;
          }}
          onPointerLeave={() => (wheelOn.current = false)}
          onFocus={() => (wheelOn.current = true)}
          onBlur={() => (wheelOn.current = false)}
          onKeyDown={onKeyDown}
        >
          <div className="flex items-center gap-3">
            {/* rotate-180으로 아래가 글줄 앞(아래쪽)에 오게 한다 */}
            <span
              aria-hidden="true"
              className="whitespace-nowrap text-xs text-muted-foreground [writing-mode:vertical-rl] [text-orientation:sideways] rotate-180 max-sm:hidden"
            >
              아래로 젖힘 · 위아래(pitch) 18°씩 3칸 · 위로 젖힘
            </span>
            <div className="relative mx-auto w-full min-w-0 max-w-[640px] flex-1">
              <div
                ref={gridEl}
                className="grid grid-cols-5 grid-rows-3 gap-1.5 sm:gap-2.5"
                aria-label={`수집 격자 ${ROLL_COLS}×${PITCH_ROWS}`}
              >
                {Array.from({ length: ROLL_COLS * PITCH_ROWS }, (_, i) => {
                  const p = PITCH_ROWS - 1 - Math.floor(i / ROLL_COLS); // 위쪽 줄이 pitch가 큰 칸
                  const k = `${p}-${i % ROLL_COLS}`;
                  const n = counts[k] ?? 0;
                  const current = collecting && verdict.key === k;
                  // 원본처럼 떨어진 둥근 칸에 색으로만 상태를 보인다: 빈 칸 회색, 1장 연한 초록, 2장 초록.
                  return (
                    <div
                      key={k}
                      aria-label={`${n} / ${PER_CELL}장`}
                      className={`h-9 rounded-lg motion-safe:transition-colors sm:h-12 sm:rounded-xl lg:h-14 ${n >= PER_CELL ? CELL_FULL : n === 1 ? CELL_ONE : CELL_EMPTY} ${current ? "ring-2 ring-project" : ""}`}
                    />
                  );
                })}
              </div>

              {/* 손 아이콘을 가리지 않게 가운데보다 아래에 둔다 */}
              <DemoHint
                text="휠을 굴리거나 손을 끌어 기울여 보세요"
                icon={<Mouse />}
                visible={!engaged}
                className="absolute left-1/2 top-[70%] z-10 -translate-x-1/2 whitespace-nowrap"
              />

              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
              >
                <div
                  className="w-8 cursor-grab touch-none select-none active:cursor-grabbing sm:w-10 lg:w-12"
                  style={{
                    // 작은 pitch도 기울기가 보이게 키운다.
                    transform: `perspective(140px) rotateX(${clamp(angle.pitch * 1.8, -70, 70)}deg) rotateZ(${angle.roll}deg)`,
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
                    tilt(
                      ((e.clientX - x) * ROLL_RANGE) / box.width,
                      (-(e.clientY - y) * PITCH_RANGE) / box.height,
                    );
                  }}
                >
                  <Hand />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            ← 왼쪽으로 돌림 · 좌우(roll) 10°씩 5칸 · 오른쪽으로 돌림 →
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 text-sm"
        aria-live="polite"
      >
        <span
          className={
            total >= TOTAL
              ? "font-medium text-project-ink"
              : "text-muted-foreground"
          }
        >
          {message}
        </span>
        <button
          type="button"
          onClick={() => {
            setCounts({});
            setLastCaptured(null);
          }}
          className="shrink-0 rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          비우기
        </button>
      </div>
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        좌우 {angle.roll.toFixed(0)}° · 위아래 {angle.pitch.toFixed(0)}°
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={`size-3 rounded ${CELL_EMPTY}`} />빈 칸
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`size-3 rounded ${CELL_ONE}`} />
          1장
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`size-3 rounded ${CELL_FULL}`} />
          2장 완료
        </span>
      </div>
    </div>
  );
}

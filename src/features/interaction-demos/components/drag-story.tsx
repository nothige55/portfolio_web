"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { JejuMap } from "./jeju-map";
import { initialRows, placesInOrder, type Row, type StepMode } from "../utils/tree-drop";
import { TreeDemo, type Preview } from "./tree-demo";

gsap.registerPlugin(ScrollTrigger);

type Step = { id: string; versions: string; title: string; body: string; mode: StepMode };

const CLOSED = "inset(40% 38% 40% 38% round 28px)";
const OPEN = "inset(0% 0% 0% 0% round 16px)";
// 타임라인 진행도(0~1)에서 각 단계가 시작하는 지점.
const STARTS = [0, 0.42, 0.65] as const;
const CENTERS = [0.3, 0.53, 0.77] as const;

// 애플 제품 페이지처럼 화면을 고정(pin)하고 스크롤 진행도에 애니메이션을 묶는다.
// 작은 카드가 무대로 커지고, 단계가 바뀌고, 끝에서 다시 줄어든다. 크기는 clip-path로만 바꿔 내용이 다시 배치되지 않는다.
export function DragStory({ steps }: { steps: readonly Step[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [animated, setAnimated] = useState(false);
  const [rows, setRows] = useState<readonly Row[]>(initialRows);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setAnimated(true);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: frame.current,
          start: "top top",
          end: "+=450%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            setStepIndex(p >= STARTS[2] ? 2 : p >= STARTS[1] ? 1 : 0);
          },
        },
      });
      trigger.current = tl.scrollTrigger ?? null;
      tl.fromTo(stage.current, { clipPath: CLOSED }, { clipPath: OPEN, duration: 0.2, ease: "power2.inOut" }, 0)
        .fromTo(label.current, { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.03)
        .fromTo(content.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.08 }, 0.14)
        .to(content.current, { opacity: 0, y: -12, duration: 0.05 }, 0.88)
        .to(stage.current, { clipPath: CLOSED, duration: 0.12, ease: "power2.inOut" }, 0.88)
        .to(label.current, { opacity: 1, duration: 0.05 }, 0.95);
      return () => {
        trigger.current = null;
        setAnimated(false);
      };
    });
    // 웹폰트가 늦게 오면 위쪽 높이가 바뀌어 pin 시작 위치가 어긋나므로 다시 계산한다.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  function go(i: number) {
    const st = trigger.current;
    if (animated && st) {
      window.scrollTo({ top: st.start + (st.end - st.start) * CENTERS[i], behavior: "smooth" });
    } else {
      setStepIndex(i);
    }
  }

  const current = steps[stepIndex];

  return (
    <div ref={frame} className="lg:h-screen lg:pt-24">
      <div
        ref={stage}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card lg:h-[calc(100vh-8rem)] lg:motion-safe:[clip-path:inset(40%_38%_40%_38%_round_28px)]"
      >
        <div
          ref={label}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center p-6 text-center lg:motion-safe:flex"
        >
          <p className="text-lg font-semibold leading-snug tracking-tight">
            드래그 하나를
            <br />
            세 번 다시 만들었어요
            <span className="mt-3 block font-mono text-xs font-normal text-muted-foreground">내려 보세요 ↓</span>
          </p>
        </div>

        <div ref={content} className="grid flex-1 content-center gap-8 p-6 lg:grid-cols-2 lg:p-12">
          <TreeDemo mode={current.mode} rows={rows} onRowsChange={setRows} onPreview={setPreview} />
          <JejuMap order={placesInOrder(rows)} preview={current.mode === "fill" ? preview : null} />
        </div>

        <div className="flex flex-col gap-3 border-t p-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-xl" aria-live="polite">
            <p className="font-mono text-xs text-muted-foreground">
              {current.versions} · {current.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="드래그 변천 단계">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-pressed={i === stepIndex}
                className="rounded-full border px-3 py-1 font-mono text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {s.versions}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

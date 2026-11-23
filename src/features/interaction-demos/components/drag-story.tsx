"use client";

import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useEffect, useRef, useState } from "react";

// 이보다 작으면 글이 읽히지 않고, V1~V3의 가로 깊이 판정(30px 기준)이 눈에 보이는 들여쓰기와 어긋난다. 모자란 높이는 스크롤로 둔다
const MIN_ZOOM = 0.8;

gsap.registerPlugin(ScrollTrigger);

type Step = { id: "a" | "b" | "c"; versions: string; title: string; body: string };

const CLOSED = "inset(40% 38% 40% 38% round 28px)";
const OPEN = "inset(0% 0% 0% 0% round 16px)";
// 타임라인 진행도(0~1)에서 각 단계가 시작하는 지점.
const STARTS = [0, 0.42, 0.65] as const;
const CENTERS = [0.3, 0.53, 0.77] as const;
// 경계 근처에서 위아래로 조금씩 흔들려도 단계가 뒤집히지 않게, 되돌아갈 때만 이만큼 더 지나야 바뀐다.
const BACK_MARGIN = 0.02;

// 애플 제품 페이지처럼 화면을 고정(pin)하고 스크롤 진행도에 애니메이션을 묶는다.
// 작은 카드가 무대로 커지고, 단계가 바뀌고, 끝에서 다시 줄어든다. 크기는 clip-path로만 바꿔 내용이 다시 배치되지 않는다.
// 데모는 features 경계 때문에 바깥(app)에서 만들어 넘겨받는다. 현재 단계의 것만 그린다.
export function DragStory({ steps, demos }: { steps: readonly Step[]; demos: Record<Step["id"], ReactNode> }) {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const fit = useRef<HTMLDivElement>(null);
  const demo = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const [stepIndex, setStepIndex] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // 새로고침하면 브라우저가 pin 여백(450%)이 생기기 전의 짧은 페이지에서 스크롤을 복원해, 엉뚱한 단계(V5~V6)에 걸린다.
    // 복원을 끄고 맨 위에서 시작한다. #trego-drag 같은 해시 이동은 영향받지 않는다.
    ScrollTrigger.clearScrollMemory("manual");
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
            setStepIndex((i) => {
              while (i < 2 && p >= STARTS[i + 1]) i++;
              while (i > 0 && p < STARTS[i] - BACK_MARGIN) i--;
              return i;
            });
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

  // 데모 높이는 고정이라(트리 행 수) 화면이 낮으면 안에서 스크롤이 생긴다. 스크롤 대신 들어갈 만큼 줄인다.
  // 드래그 중에는 자리 확보로 높이가 바뀌므로 배율을 고정해 두고, 놓은 뒤에 다시 맞춘다.
  useEffect(() => {
    const box = fit.current;
    const inner = demo.current;
    if (!box || !inner || !animated) {
      setZoom(1);
      return;
    }
    // 단계가 바뀌어도 화면에 걸린 배율에서 이어서 계산한다
    let current = parseFloat(inner.style.zoom) || 1;
    let dragging = false;
    const apply = () => {
      if (dragging) return;
      // 줄인 상태의 rect는 화면 기준이라 배율로 나눠 원래 높이를 구한다
      const natural = inner.getBoundingClientRect().height / current;
      const next = Math.min(1, Math.max(MIN_ZOOM, box.clientHeight / natural));
      if (Math.abs(next - current) < 0.01) return;
      current = next;
      setZoom(next);
    };
    const down = () => {
      dragging = true;
    };
    const up = () => {
      dragging = false;
      apply();
    };
    const observer = new ResizeObserver(apply);
    observer.observe(box);
    observer.observe(inner);
    box.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    apply();
    return () => {
      observer.disconnect();
      box.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [animated, stepIndex]);

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
            세 번 다시 만들었습니다
            <span className="mt-3 flex items-center justify-center gap-1 font-mono text-xs font-normal text-muted-foreground">
              내려 보세요
              <ArrowDown aria-hidden="true" className="size-3" />
            </span>
          </p>
        </div>

        <div ref={content} className="min-h-0 flex-1 p-6 lg:p-8">
          <div ref={fit} className="h-full overflow-y-auto">
            <div key={current.id} ref={demo} style={{ zoom }}>
              {demos[current.id]}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t p-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          {/* 모든 단계의 설명을 같은 칸에 겹쳐 두고 현재 것만 보인다. 가장 긴 설명 기준으로 푸터 높이가 고정돼 단계가 바뀌어도 칩과 데모가 움직이지 않는다. */}
          <div className="grid max-w-xl" aria-live="polite">
            {steps.map((s, i) => (
              <div key={s.id} className={`col-start-1 row-start-1 ${i === stepIndex ? "" : "invisible"}`}>
                <p className="font-mono text-xs text-muted-foreground">
                  {s.versions} · {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
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

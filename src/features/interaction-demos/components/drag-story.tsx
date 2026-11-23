"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useEffect, useRef, useState } from "react";

// 이보다 작으면 글이 읽히지 않고, V1~V3의 가로 깊이 판정(30px 기준)이 눈에 보이는 들여쓰기와 어긋난다. 모자란 높이는 스크롤로 둔다
const MIN_ZOOM = 0.8;

gsap.registerPlugin(ScrollTrigger);

type Step = { id: "a" | "b" | "c"; versions: string; title: string; body: string };

// 고정 진행도 0~ASSEMBLED는 무대 조립 구간이고, 나머지를 세 단계가 고르게 나눈다.
const ASSEMBLED = 0.2;
// 타임라인 진행도(0~1)에서 각 단계가 시작하는 지점.
const STARTS = [0, 0.467, 0.733] as const;
const CENTERS = [0.335, 0.6, 0.867] as const;
// 경계 근처에서 위아래로 조금씩 흔들려도 단계가 뒤집히지 않게, 되돌아갈 때만 이만큼 더 지나야 바뀐다.
const BACK_MARGIN = 0.02;

// 애플 제품 페이지처럼 화면을 고정(pin)하고 스크롤 진행도에 애니메이션을 묶는다.
// 프레임은 보이지 않은 채 소개 위로 겹쳐 올라오고, 고정이 시작되면 그 자리에서 무대 → 트리 → 지도 → 하단 줄 순으로 조립된다.
// 조립 뒤 고정 중에 단계가 바뀌고, 고정이 풀리면 그대로 위로 스크롤돼 나간다.
// 데모는 features 경계 때문에 바깥(app)에서 만들어 넘겨받는다. 현재 단계의 것만 그린다.
export function DragStory({ steps, demos }: { steps: readonly Step[]; demos: Record<Step["id"], ReactNode> }) {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const fit = useRef<HTMLDivElement>(null);
  const demo = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const [stepIndex, setStepIndex] = useState(0);
  const [animated, setAnimated] = useState(false);
  // 조립이 끝나기 전에는 조작을 받지 않는다. 안 그러면 보이지 않는 데모가 휠과 드래그를 가져간다.
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // 새로고침하면 브라우저가 pin 여백(380%)이 생기기 전의 짧은 페이지에서 스크롤을 복원해, 엉뚱한 단계(V5~V6)에 걸린다.
    // 복원을 끄고 맨 위에서 시작한다. #trego-drag 같은 해시 이동은 영향받지 않는다.
    ScrollTrigger.clearScrollMemory("manual");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setAnimated(true);
      setReady(false);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: frame.current,
          start: "top top",
          end: "+=380%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onToggle: (self) => setReady(self.progress >= ASSEMBLED),
          onUpdate: (self) => {
            const p = self.progress;
            setReady(p >= ASSEMBLED);
            setStepIndex((i) => {
              while (i < 2 && p >= STARTS[i + 1]) i++;
              while (i > 0 && p < STARTS[i] - BACK_MARGIN) i--;
              return i;
            });
          },
        },
      });
      trigger.current = tl.scrollTrigger ?? null;
      // 조립: 고정된 자리에서 화면 전체가 한 번에 짜인다. 고정 전에는 from 값(opacity 0)이라 프레임이 보이지 않는다.
      // content의 --asm-* 변수 이름은 dnd DemoFrame과 맞춘다.
      tl.fromTo(stage.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.09, ease: "power2.out" }, 0)
        .fromTo(
          content.current,
          { "--asm-tree-x": "-160px", "--asm-tree-y": "0px", "--asm-tree-o": 0 },
          { "--asm-tree-x": "0px", "--asm-tree-o": 1, duration: 0.08, ease: "power3.out" },
          0.04,
        )
        .fromTo(
          content.current,
          { "--asm-map-x": "120px", "--asm-map-y": "60px", "--asm-map-s": 0.94, "--asm-map-o": 0 },
          { "--asm-map-x": "0px", "--asm-map-y": "0px", "--asm-map-s": 1, "--asm-map-o": 1, duration: 0.08, ease: "power3.out" },
          0.08,
        )
        .fromTo(footer.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0.13)
        .to({}, { duration: 1 - 0.19 }, 0.19);
      return () => {
        trigger.current = null;
        setAnimated(false);
        setReady(true);
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
      // 무대에 scale이 걸린 동안(등장) 재면 배율이 틀어지므로 고정 중에만 맞춘다
      if (!ready || dragging) return;
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
  }, [animated, stepIndex, ready]);

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
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card lg:h-[calc(100vh-8rem)]"
        inert={!ready}
      >
        {/* 등장 때 --asm-* 변수를 여기에 tween한다. 변수 이름은 dnd DemoFrame과 맞춘다 */}
        <div ref={content} className="min-h-0 flex-1 p-6 lg:p-8">
          <div ref={fit} className="h-full overflow-y-auto">
            <div key={current.id} ref={demo} style={{ zoom }}>
              {demos[current.id]}
            </div>
          </div>
        </div>

        <div ref={footer} className="flex flex-col gap-3 border-t p-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
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

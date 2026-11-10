"use client";

import { useEffect, useRef, useState } from "react";

type Panel = { label: string; node: React.ReactNode };

const TICKS = 40;

// 세로 스크롤을 가로 이동으로 바꾼다. 좁은 화면이나 모션 줄이기 설정에서는 세로로 쌓인다(CSS와 같은 조건).
export function FilmStrip({ panels }: { panels: readonly Panel[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;

    function update() {
      raf = 0;
      const w = wrap.current;
      const t = track.current;
      if (!w || !t) return;
      if (!mq.matches) {
        t.style.transform = "";
        w.style.height = "";
        return;
      }
      const dist = t.scrollWidth - window.innerWidth;
      w.style.height = `${dist + window.innerHeight}px`;
      const p = Math.min(1, Math.max(0, -w.getBoundingClientRect().top / dist));
      t.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (ruler.current && box.current) {
        box.current.style.transform = `translateX(${p * (ruler.current.clientWidth - box.current.clientWidth)}px)`;
      }
      setIndex(Math.round(p * (panels.length - 1)));
    }
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    mq.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      mq.removeEventListener("change", request);
    };
  }, [panels.length]);

  return (
    <div ref={wrap} className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-6 z-30 hidden flex-col items-center gap-2 md:motion-safe:flex"
      >
        <div ref={ruler} className="relative flex h-4 w-[300px] items-center justify-between px-px">
          {Array.from({ length: TICKS }, (_, i) => (
            <span key={i} className="h-3 w-px bg-neutral-400" />
          ))}
          <span
            ref={box}
            className="absolute left-0 top-0 h-4 w-8 rounded-[3px] border border-neutral-700 bg-[#ededed]/60"
          />
        </div>
        <span className="font-mono text-xs text-neutral-500">{panels[index].label}</span>
      </div>

      <div className="md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:items-center md:motion-safe:overflow-hidden">
        <div
          ref={track}
          className="flex flex-col gap-6 px-4 py-10 md:motion-safe:w-max md:motion-safe:flex-row md:motion-safe:gap-6 md:motion-safe:px-12 md:motion-safe:py-0 md:motion-safe:will-change-transform"
        >
          {panels.map((p) => (
            <section
              key={p.label}
              aria-label={p.label}
              className="flex shrink-0 flex-col gap-2 md:motion-safe:w-[min(78vw,720px)]"
            >
              <span className="font-mono text-xs text-neutral-500 md:motion-safe:hidden">{p.label}</span>
              <div className="rounded-sm bg-white p-6 md:p-10 md:motion-safe:h-[min(70vh,540px)] md:motion-safe:overflow-hidden">
                {p.node}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

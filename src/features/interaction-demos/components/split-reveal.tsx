"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

// 화면을 고정하고 스크롤 진행도에 묶는다: 가운데에 있던 글이 왼쪽으로 물러나고, 오른쪽에서 데모가 나타난다.
// 좁은 화면과 움직임 줄이기에서는 고정 없이 글 다음에 데모가 바로 놓인다.
export function SplitReveal({ text, demo }: { text: React.ReactNode; demo: React.ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const textEl = useRef<HTMLDivElement>(null);
  const demoEl = useRef<HTMLDivElement>(null);
  // 데모가 다 나타나기 전에는 조작을 받지 않는다. 안 그러면 보이지도 않는 데모가 휠을 가져가 스크롤이 막힌다.
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setReady(false);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: frame.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setReady(self.progress >= 0.95),
        },
      });
      // 글은 처음에 화면 가운데에 있다가 왼쪽 열 가운데로 간다. 열 사이 간격(gap-10)의 절반만큼 보정한다.
      tl.fromTo(textEl.current, { x: () => (grid.current?.offsetWidth ?? 0) / 4 + 10 }, { x: 0, ease: "power2.inOut", duration: 0.55 }, 0)
        .fromTo(demoEl.current, { opacity: 0, scale: 0.92, x: 64 }, { opacity: 1, scale: 1, x: 0, ease: "power2.out", duration: 0.45 }, 0.45);
      return () => setReady(true);
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <div ref={frame} className="overflow-x-clip lg:h-screen lg:pt-11">
      <div ref={grid} className="grid gap-10 py-20 lg:h-full lg:grid-cols-2 lg:items-center lg:py-0">
        <div ref={textEl} className="text-center">
          {text}
        </div>
        <div ref={demoEl} inert={!ready} className="lg:motion-safe:opacity-0">
          {demo}
        </div>
      </div>
    </div>
  );
}

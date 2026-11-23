"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// 둥근 무대가 clip-path로 전체 폭까지 펴진다. 좁은 화면과 움직임 줄이기에서는 평범한 카드다.
// refreshPriority -1: 앞선 pin 구간의 여백이 먼저 계산된 뒤 시작 위치를 잡는다.
// 페이지 맨 끝 구간이라 center center에는 스크롤이 닿지 않는다. 바닥이 화면 바닥에 올 때 다 펴지게 한다.
export function ExpandStage({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { clipPath: "inset(10% 14% 10% 14% round 40px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 20px)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.6, refreshPriority: -1 },
        },
      );
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

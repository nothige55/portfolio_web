"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// 둥근 무대가 clip-path로 전체 폭까지 펴진다. 좁은 화면과 움직임 줄이기에서는 평범한 카드다.
// refreshPriority -1: 앞선 pin 구간의 여백이 먼저 계산된 뒤 시작 위치를 잡는다.
// 화면에 들어오는 동안 펴지고(고정 위치에 닿기 전에 다 펴짐), 다 펴진 채 히어로·드래그 데모처럼 잠시 고정된 뒤 페이지가 끝난다.
// 고정 위치는 상단 경로 막대(h-11 = 44px) 아래 32px. 카드 높이(page.tsx)와 페이지 아래 여백(pb-8)도 32px에 맞춰, 위아래 여백이 같다.
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
          scrollTrigger: { trigger: el, start: "top 85%", end: "top 35%", scrub: 0.6, refreshPriority: -1 },
        },
      );
      ScrollTrigger.create({ trigger: el, start: "top 76px", end: "+=30%", pin: true, refreshPriority: -1 });
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

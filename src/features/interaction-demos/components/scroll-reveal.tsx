"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// 직계 자식들이 스크롤 진행도에 맞춰 차례로 올라온다. 시간이 아니라 스크롤에 묶여 혼자 재생되지 않는다.
export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        gsap.utils.toArray(el.children),
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 65%", scrub: 0.6 },
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

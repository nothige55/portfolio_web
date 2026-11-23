"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// 프로젝트가 처음 나올 때 화면을 고정하고, 머리줄 → 큰 이름 → 소개 문장이 차례로 나온다.
// 이름과 머리줄은 글자 높이만큼 가린 틀 안에서 솟아오른다. 그 뒤 제자리에서 흐려지며 사라지고, 같은 구간에서 다음 데모가 아래에서 겹쳐 올라온다.
// 좁은 화면과 움직임 줄이기에서는 고정 없이 최종 상태가 그대로 보인다.
export function ProjectTitle({ eyebrow, name, lines }: { eyebrow: string; name: string; lines: readonly string[] }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const group = el.querySelector<HTMLElement>("[data-group]");
      if (!group) return;
      // 등장은 고정 전, 화면에 들어오는 동안 끝낸다. 고정 뒤에 등장시키면 들어오는 동안 빈 화면이 한 장 생긴다.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 45%", end: "top top", scrub: 0.6, invalidateOnRefresh: true },
        })
        .fromTo("[data-eyebrow] [data-rise]", { yPercent: 100 }, { yPercent: 0, duration: 0.3 }, 0)
        .fromTo("[data-name] [data-rise]", { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power3.out" }, 0.15)
        .fromTo("[data-line]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.1 }, 0.5);
      // 앞 30%는 머묾, 뒤 100%는 뒤따르는 데모와 겹치는 구간이다(데모 블록이 -mt-[100vh]로 올라온다). 겹침은 30/130 ≈ 0.23에서 시작한다.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=130%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
        })
        .to(group, { opacity: 0, scale: 0.96, duration: 0.45 }, 0.23)
        .to({}, { duration: 0.32 }, 0.68);
    }, el);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <div ref={frame} className="relative flex flex-col items-center justify-center py-24 text-center lg:h-screen lg:py-0">
      <div data-group className="flex flex-col items-center">
        <p data-eyebrow className="block overflow-hidden pb-[0.08em] font-mono text-sm text-muted-foreground sm:text-base">
          <span data-rise className="block">
            {eyebrow}
          </span>
        </p>
        <h2
          data-name
          className="mt-4 block overflow-hidden pb-[0.08em] text-[clamp(3rem,11vw,9rem)] font-bold leading-[1.05] tracking-[-0.045em]"
        >
          <span data-rise className="block">
            {name}
          </span>
        </h2>
        {lines.map((line, i) => (
          <p
            key={line}
            data-line
            className={i === 0 ? "mt-8 text-xl font-medium sm:text-2xl" : "mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground"}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

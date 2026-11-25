"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

// 글은 처음부터 자기 열에 있고, 구간이 화면에 들어오는 동안 반대쪽에서 데모가 스크롤 진행도에 맞춰 나타난다.
// 예전에는 화면을 고정하고 가운데 글이 물러난 뒤 데모가 나왔는데, 그동안 글만 있는 빈 화면이 한 장 생겨 고정을 뺐다.
// 데모 열을 글 열보다 넓게(2:3) 잡아 데모가 화면을 채운다. 좁은 화면과 움직임 줄이기에서는 글 다음에 데모가 바로 놓인다.
// textSide는 글이 놓이는 쪽이다. 구간마다 달리해서 같은 배치가 반복돼 보이지 않게 한다.
export function SplitReveal({
  text,
  demo,
  textSide = "left",
  revealStart = "top 75%",
  wideDemo = true,
}: {
  text: React.ReactNode;
  demo: React.ReactNode;
  textSide?: "left" | "right";
  // 프로젝트 제목(ProjectTitle) 고정 구간에 겹쳐 올라오는 경우, 제목이 흐려진 뒤에 나오도록 늦춘다.
  revealStart?: string;
  // 데모가 좁은 패널(원본 폭 320px 등)이면 끄고 반반으로 나눈다. 넓은 열에 두면 양옆이 빈다.
  wideDemo?: boolean;
}) {
  const dir = textSide === "left" ? 1 : -1;
  const frame = useRef<HTMLDivElement>(null);
  const demoEl = useRef<HTMLDivElement>(null);
  // 데모가 다 나타나기 전에는 조작을 받지 않는다. 안 그러면 보이지도 않는 데모가 휠을 가져가 스크롤이 막힌다.
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setReady(false);
      gsap.fromTo(
        demoEl.current,
        { opacity: 0, scale: 0.94, x: dir * 64 },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: frame.current,
            start: revealStart,
            end: "top 15%",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => setReady(self.progress >= 0.95),
          },
        },
      );
      return () => setReady(true);
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, [dir, revealStart]);

  return (
    <div ref={frame} className="overflow-x-clip lg:h-screen lg:pt-11">
      <div
        className={`grid gap-12 py-20 lg:h-full lg:items-center lg:py-0 ${!wideDemo ? "lg:grid-cols-2" : textSide === "right" ? "lg:grid-cols-[3fr_2fr]" : "lg:grid-cols-[2fr_3fr]"}`}
      >
        <div className={textSide === "right" ? "lg:order-2" : ""}>
          {text}
        </div>
        <div ref={demoEl} inert={!ready} className={`lg:motion-safe:opacity-0 ${textSide === "right" ? "lg:order-1" : ""}`}>
          {demo}
        </div>
      </div>
    </div>
  );
}

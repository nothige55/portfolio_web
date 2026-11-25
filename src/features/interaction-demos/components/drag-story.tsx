"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

type Step = {
  id: "a" | "b" | "c";
  versions: string;
  title: string;
  body: string;
};

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
export function DragStory({
  steps,
  demos,
}: {
  steps: readonly Step[];
  demos: Record<Step["id"], ReactNode>;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [animated, setAnimated] = useState(false);
  // 조립이 끝나기 전에는 조작을 받지 않는다. 안 그러면 보이지 않는 데모가 휠과 드래그를 가져간다.
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // 새로고침하면 브라우저가 pin 여백(380%)이 생기기 전의 짧은 페이지에서 스크롤을 복원해, 엉뚱한 단계(V5~V6)에 걸린다.
    // 복원을 끄고 맨 위에서 시작한다. #trego-drag 같은 해시 이동은 영향받지 않는다.
    ScrollTrigger.clearScrollMemory("manual");
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
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
        tl.fromTo(
          stage.current,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.09, ease: "power2.out" },
          0,
        )
          .fromTo(
            content.current,
            {
              "--asm-tree-x": "-160px",
              "--asm-tree-y": "0px",
              "--asm-tree-o": 0,
            },
            {
              "--asm-tree-x": "0px",
              "--asm-tree-o": 1,
              duration: 0.08,
              ease: "power3.out",
            },
            // 무대와 같이 시작한다. 늦게 들어오면 조립 첫 장면이 빈 흰 창으로 보인다.
            0,
          )
          .fromTo(
            content.current,
            {
              "--asm-map-x": "120px",
              "--asm-map-y": "60px",
              "--asm-map-o": 0,
            },
            {
              "--asm-map-x": "0px",
              "--asm-map-y": "0px",
              "--asm-map-o": 1,
              duration: 0.08,
              ease: "power3.out",
            },
            0.08,
          )
          .fromTo(
            footer.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.06 },
            0.13,
          )
          .to({}, { duration: 1 - 0.19 }, 0.19);
        return () => {
          trigger.current = null;
          setAnimated(false);
          setReady(true);
        };
      },
    );
    // 웹폰트가 늦게 오면 위쪽 높이가 바뀌어 pin 시작 위치가 어긋나므로 다시 계산한다.
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      // 해시 링크(/trego의 /#trego-drag)는 pin 여백이 생기기 전 위치에 멈춰 조립 전 빈 무대 앞에 선다. 조립이 끝난 첫 단계로 보낸다.
      const st = trigger.current;
      const target =
        location.hash &&
        document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (st && target && frame.current && target.contains(frame.current)) {
        window.scrollTo({ top: st.start + (st.end - st.start) * CENTERS[0] });
      }
    });
    return () => mm.revert();
  }, []);

  function go(i: number) {
    const st = trigger.current;
    if (animated && st) {
      window.scrollTo({
        top: st.start + (st.end - st.start) * CENTERS[i],
        behavior: "smooth",
      });
    } else {
      setStepIndex(i);
    }
  }

  const current = steps[stepIndex];

  return (
    <div ref={frame} className="lg:h-screen lg:pt-24">
      <div
        ref={stage}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 shadow-[0_40px_100px_-40px_color-mix(in_srgb,var(--project)_55%,transparent)] lg:h-[calc(100vh-8rem)]"
        inert={!ready}
      >
        {/* 앱 창처럼 보이게 하는 장식용 제목 막대 */}
        <div aria-hidden="true" className="relative flex h-9 shrink-0 items-center border-b border-border/60 bg-muted/40 px-4">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="absolute inset-x-0 text-center text-xs text-muted-foreground">Trego — 제주도 여행</span>
        </div>
        {/* 등장 때 --asm-* 변수를 여기에 tween한다. 변수 이름은 dnd DemoFrame과 맞춘다. 사이드바·지도가 창 가장자리에 닿도록 패딩이 없고, 푸터 카드는 지도 오른쪽 아래에 얹는다 */}
        <div ref={content} className="relative flex min-h-0 flex-1 flex-col">
          <div key={current.id} className="flex min-h-0 flex-1 flex-col">
            {demos[current.id]}
          </div>

          <div
            ref={footer}
            className="flex flex-col gap-3 border-t bg-card p-4 lg:absolute lg:right-4 lg:bottom-4 lg:w-[360px] lg:rounded-xl lg:border-t-0 lg:bg-card/95 lg:shadow-lg lg:ring-1 lg:ring-black/5 lg:backdrop-blur"
          >
            {/* 모든 단계의 설명을 같은 칸에 겹쳐 두고 현재 것만 보인다. 가장 긴 설명 기준으로 푸터 높이가 고정돼 단계가 바뀌어도 칩과 데모가 움직이지 않는다. */}
            <div className="grid" aria-live="polite">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`col-start-1 row-start-1 ${i === stepIndex ? "" : "invisible"}`}
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    {s.versions} · {s.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="flex gap-2"
              role="group"
              aria-label="드래그 변천 단계"
            >
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-pressed={i === stepIndex}
                  className="rounded-full border px-3 py-1 font-mono text-xs transition-colors hover:border-brand hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:font-semibold aria-pressed:text-white aria-pressed:hover:border-brand-hover aria-pressed:hover:bg-brand-hover"
                >
                  {s.versions}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

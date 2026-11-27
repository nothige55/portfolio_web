"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// 프로젝트 표지. 화면을 고정하고 큰 이름 → 소개 문장 → 기간·팀·역할·스택 칸이 차례로 나온다.
// 한 화면을 이름과 글 몇 줄로만 쓰면 비어 보여서, 채용 쪽에서 먼저 찾는 정보를 표지에 크게 깐다.
// 이름은 글자 높이만큼 가린 틀 안에서 솟아오른다. 그 뒤 제자리에서 흐려지며 사라지고, 같은 구간에서 다음 데모가 아래에서 겹쳐 올라온다.
// 좁은 화면과 움직임 줄이기에서는 고정 없이 최종 상태가 그대로 보인다.
type Meta = { period: string; role: string; stack: readonly string[] };

export function ProjectTitle({
  name,
  lines,
  meta,
}: {
  name: string;
  lines: readonly string[];
  meta: Meta;
}) {
  // "4인 · 프론트엔드 …"를 팀과 역할 칸으로 나눈다.
  const [team, ...roleParts] = meta.role.split(" · ");
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const group = el.querySelector<HTMLElement>("[data-group]");
      if (!group) return;
      // 등장은 고정 전, 화면에 들어오는 동안 끝낸다. 고정 뒤에 등장시키면 들어오는 동안 빈 화면이 한 장 생긴다.
      const reveal = gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 45%", end: "top top", scrub: 0.6, invalidateOnRefresh: true },
        })
        .fromTo("[data-name] [data-rise]", { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power3.out" }, 0);
      // 줄마다 따로 건다. stagger로 묶으면 뒤 줄의 시작 상태가 미리 적용되지 않아 부제보다 먼저 보인다.
      el.querySelectorAll("[data-line]").forEach((line, i) => {
        reveal.fromTo(line, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.5 + i * 0.1);
      });
      // 고정 100% 전체가 뒤따르는 데모 블록(-mt-[100vh])과 겹친다. 데모가 보이지 않게 올라오는 동안 소개가 흐려져, 데모 고정이 시작될 때 사라진다.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=100%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
        })
        .to(group, { opacity: 0, scale: 0.96, duration: 0.6 }, 0.35)
        .to({}, { duration: 0.05 }, 0.95);
    }, el);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <div ref={frame} className="relative flex flex-col justify-center py-24 lg:h-screen lg:py-0">
      <div data-group>
        <h2
          data-name
          className="block overflow-hidden pb-[0.08em] text-[clamp(3rem,11vw,9rem)] font-bold leading-[1.05] tracking-[-0.045em] text-project"
        >
          <span data-rise className="block">
            {name}
          </span>
        </h2>
        {lines.map((line, i) => (
          <p
            key={line}
            data-line
            className={
              i === 0
                ? "mt-6 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
                : "mt-4 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground"
            }
          >
            {line}
          </p>
        ))}
        <dl data-line className="mt-12 grid gap-8 border-t border-project/20 pt-8 sm:grid-cols-[1fr_1fr_2fr]">
          <div className="space-y-2">
            <dt className="font-mono text-sm text-project-ink">기간</dt>
            <dd className="text-lg font-medium tabular-nums">{meta.period}</dd>
          </div>
          <div className="space-y-2">
            <dt className="font-mono text-sm text-project-ink">팀 · 역할</dt>
            <dd className="text-lg font-medium">
              {team}
              {roleParts.length > 0 && <span className="block text-base font-normal text-muted-foreground">{roleParts.join(" · ")}</span>}
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="font-mono text-sm text-project-ink">스택</dt>
            <dd className="flex flex-wrap gap-1.5">
              {meta.stack.map((s) => (
                <span key={s} className="rounded-full bg-background px-3 py-1 text-sm font-medium text-project-ink ring-1 ring-project/15">
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

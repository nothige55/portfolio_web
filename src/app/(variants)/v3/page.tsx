import type { Metadata } from "next";
import { approach, education, projects, stack } from "@/config/content";
import { site } from "@/config/site";
import { Reveal } from "@/features/variant-scroll/components/reveal";
import { SectionIndex } from "@/features/variant-scroll/components/section-index";
import { SpotlightCard } from "@/features/variant-scroll/components/spotlight-card";

export const metadata: Metadata = { title: "V3 스크롤" };

const sections = [
  { id: "trego", label: "Trego" },
  { id: "surgiauth", label: "SurgiAuth" },
  { id: "approach", label: "방식" },
  { id: "contact", label: "연락" },
] as const;

const big = "font-heading text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[1.05] tracking-tight";

export default function V3Page() {
  return (
    <div
      className="relative min-h-screen pb-32"
      style={
        {
          "--background": "oklch(0.13 0.01 260)",
          "--foreground": "oklch(0.97 0 0)",
          "--card": "oklch(0.18 0.015 260)",
          "--muted-foreground": "oklch(0.7 0.01 260)",
          "--border": "oklch(1 0 0 / 12%)",
          "--primary": "oklch(0.72 0.15 255)",
          "--ring": "oklch(0.72 0.15 255)",
          background: "var(--background)",
          color: "var(--foreground)",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-primary [animation-timeline:scroll()] [animation:grow_linear_both] motion-reduce:hidden"
      />
      <style>{`@keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>

      <div className="mx-auto max-w-[1100px] px-4">
        <header className="flex items-center justify-between py-6 font-mono text-xs">
          <span>{site.name}</span>
          <span className="text-muted-foreground">프론트엔드 개발자</span>
        </header>

        <section className="py-24 sm:py-36">
          <h1 className={big}>
            문제를 먼저
            <br />
            <span className="text-primary">찾는</span> 개발자.
          </h1>
          <p className="mt-8 max-w-lg leading-relaxed text-muted-foreground">{approach}</p>
        </section>
      </div>

      <div className="overflow-hidden border-y border-border py-4" aria-hidden>
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-10 font-mono text-sm text-muted-foreground motion-reduce:animate-none">
          {[...stack, ...stack].map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { to { transform: translateX(-50%) } }`}</style>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pt-24 lg:grid-cols-[180px_1fr]">
        <SectionIndex items={sections} />

        <div className="space-y-40">
          {projects.map((p) => (
            <section key={p.id} id={p.id} className="scroll-mt-24 space-y-8">
              <Reveal>
                <p className="font-mono text-xs text-muted-foreground">
                  {p.period} · {p.role}
                </p>
                <h2 className={`${big} mt-3`}>{p.name}</h2>
                <p className="mt-2 text-lg text-primary">{p.kicker}</p>
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{p.summary}</p>
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {p.points.map((pt) => (
                  <Reveal key={pt.title}>
                    <SpotlightCard>
                      <h3 className="font-heading text-lg font-bold">{pt.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pt.body}</p>
                    </SpotlightCard>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

          <section id="approach" className="scroll-mt-24">
            <Reveal>
              <p className="font-mono text-xs text-muted-foreground">방식</p>
              <blockquote className={`${big} mt-4`}>
                “쓰다가 불편한 곳을
                <br />
                직접 정의해요.”
              </blockquote>
            </Reveal>
          </section>

          <section id="contact" className="scroll-mt-24 space-y-4">
            <Reveal>
              <h2 className={big}>이야기해요.</h2>
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
                {site.email && (
                  <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                    {site.email}
                  </a>
                )}
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  GitHub
                </a>
              </p>
              <p className="mt-6 text-sm text-muted-foreground">{education}</p>
            </Reveal>
          </section>
        </div>
      </div>
    </div>
  );
}

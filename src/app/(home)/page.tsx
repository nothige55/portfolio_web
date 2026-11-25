import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { dragSteps, education, projects, stack, surgiNotes, surgiPairs, type Note } from "@/config/content";
import { site } from "@/config/site";
import { BreadcrumbDemo } from "@/features/dnd/breadcrumb/components/breadcrumb-demo";
import { CopyLink } from "@/features/interaction-demos/components/copy-link";
import { CoverageGrid } from "@/features/interaction-demos/components/coverage-grid";
import { DemoSlot } from "@/features/dnd/components/demo-slot";
import { DragStory } from "@/features/interaction-demos/components/drag-story";
import { ExpandStage } from "@/features/interaction-demos/components/expand-stage";
import { ProjectTitle } from "@/features/interaction-demos/components/project-title";
import { ScrollReveal } from "@/features/interaction-demos/components/scroll-reveal";
import { SplitReveal } from "@/features/interaction-demos/components/split-reveal";
import { HashScroll } from "@/features/variant-story/components/hash-scroll";
import { PathBar } from "@/features/variant-story/components/path-bar";
import { ScrollCue } from "@/features/variant-story/components/scroll-cue";
import { TypedText } from "@/features/variant-story/components/typed-text";

const [trego, surgi] = projects;
const big = "text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em]";
// 첫 화면 제목은 다른 구간 제목보다 크게 둔다.
const hero = "text-[clamp(2rem,6vw,5rem)] font-bold leading-[1.1] tracking-[-0.035em]";
const label = "font-mono text-sm text-project-ink";
const link =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// 무대 아래에 실제 구현에서 나온 수치를 붙인다. 값이 없으면 그리지 않는다.
function Notes({ items }: { items: readonly Note[] }) {
  if (!items.length) return null;
  return (
    <dl className="mt-8 grid gap-6 sm:grid-cols-3">
      {items.map((n) => (
        <div key={n.value}>
          <dt className="text-3xl font-bold tabular-nums text-project-ink">{n.value}</dt>
          <dd className="mt-2 leading-relaxed text-muted-foreground">{n.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function V4Page() {
  return (
    <div className="home min-h-screen bg-background pb-32 pt-11 text-foreground">
      <PathBar name={site.name} />
      <ScrollCue />
      <HashScroll />

      <div className="mx-auto max-w-[1100px] px-4">
        <section id="intro" className="flex min-h-[75vh] flex-col items-center justify-center py-20">
          <div className="w-fit text-left">
            <h1 className={hero}>
              <TypedText
                prefix="어떻게 "
                words={["움직이는지", "반응하는지", "이어지는지"]}
                suffix="궁금한 UI가 많습니다."
              />
            </h1>
            <p className="mt-6 font-mono text-sm text-muted-foreground">{site.name} · Frontend Developer</p>
          </div>
        </section>

        <div className="project-band [--band-to:var(--surgi-soft)]">
          <section id="trego">
            <ProjectTitle eyebrow={`${trego.period} · ${trego.role}`} name={trego.name} lines={[trego.kicker, trego.summary]} />
          </section>

          <section id="trego-drag" className="relative z-10 lg:motion-safe:-mt-[100vh]">
            <DragStory
              steps={dragSteps}
              demos={{ a: <DemoSlot id="a" />, b: <DemoSlot id="b" />, c: <DemoSlot id="c" /> }}
            />
          </section>

          <section id="trego-nav">
            <SplitReveal
              wideDemo={false}
              text={
                <div className="space-y-5">
                  <p className={label}>탐색</p>
                  <h3 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.03em]">{trego.points[0].title}</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">{trego.points[0].body}</p>
                  <p className="pt-2">
                    <Link href="/trego" className={`${link} inline-flex items-center gap-1 font-medium text-project-ink`}>
                      Trego 설계 전체 보기
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </p>
                </div>
              }
              demo={
                <BreadcrumbDemo />
              }
            />
          </section>
        </div>

        <div className="project-band project-surgi [--band-from:var(--surgi-soft)]">
          <section id="surgiauth">
            <ProjectTitle eyebrow={`${surgi.period} · ${surgi.role}`} name={surgi.name} lines={[surgi.kicker, surgi.summary]} />
            <div className="relative z-10 lg:motion-safe:-mt-[100vh]">
              <SplitReveal
                textSide="right"
                revealStart="top 45%"
                text={
                  <div className="space-y-10">
                    {surgiPairs.map((p) => (
                      <div key={p.decision} className="space-y-3 border-l-2 border-project pl-5">
                        <p className="leading-relaxed text-muted-foreground">{p.problem}</p>
                        <p className="text-xl font-semibold leading-snug tracking-[-0.02em]">{p.decision}</p>
                      </div>
                    ))}
                  </div>
                }
                demo={
                  <CoverageGrid />
                }
              />
            </div>
            <ScrollReveal className="pb-12">
              <Notes items={surgiNotes} />
            </ScrollReveal>
          </section>
        </div>

        <section id="about" className="py-14">
          <ExpandStage className="rounded-[20px] bg-brand-soft px-6 py-20 sm:px-12 sm:py-28">
            <ScrollReveal className="mx-auto max-w-3xl space-y-12">
              <div className="space-y-6">
                <p className={label}>소개</p>
                <h2 className={big}>
                  {site.name}
                  <span className="text-brand">.</span>
                </h2>
                <p className="text-xl font-medium sm:text-2xl">{site.tagline}</p>
                <p className="leading-relaxed text-muted-foreground">인터랙션 디자인과 HCI에 관심이 있습니다.</p>
              </div>
              <dl className="grid gap-8 sm:grid-cols-3">
                <div className="space-y-3">
                  <dt className={label}>스택</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {stack.map((s) => (
                      <span key={s} className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-brand-ink">
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="space-y-3">
                  <dt className={label}>학력</dt>
                  <dd className="text-sm leading-relaxed">{education}</dd>
                </div>
                <div className="space-y-3">
                  <dt className={label}>연락처</dt>
                  <dd className="space-y-1">
                    {site.email && <CopyLink text={site.email} />}
                    <p>
                      <a href={site.github} target="_blank" rel="noopener noreferrer" className={link}>
                        GitHub
                      </a>
                    </p>
                  </dd>
                </div>
              </dl>
            </ScrollReveal>
          </ExpandStage>
        </section>
      </div>
    </div>
  );
}

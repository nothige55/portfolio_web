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
import { ScrollReveal } from "@/features/interaction-demos/components/scroll-reveal";
import { SplitReveal } from "@/features/interaction-demos/components/split-reveal";
import { PathBar } from "@/features/variant-story/components/path-bar";
import { ScrollCue } from "@/features/variant-story/components/scroll-cue";
import { TypedText } from "@/features/variant-story/components/typed-text";

const [trego, surgi] = projects;
const big = "text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em]";
// 첫 화면 제목은 다른 구간 제목보다 크게 둔다.
const hero = "text-[clamp(2rem,6vw,5rem)] font-bold leading-[1.1] tracking-[-0.035em]";
const label = "font-mono text-xs text-muted-foreground";
const link =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// 구간마다 데모가 가장 큰 요소가 되도록 회색 무대 하나에 올린다.
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] bg-stage p-6 sm:p-8">{children}</div>;
}

// 무대 아래에 실제 구현에서 나온 수치를 붙인다. 값이 없으면 그리지 않는다.
function Notes({ items }: { items: readonly Note[] }) {
  if (!items.length) return null;
  return (
    <dl className="mt-8 grid gap-6 sm:grid-cols-3">
      {items.map((n) => (
        <div key={n.value}>
          <dt className="text-lg font-semibold tabular-nums">{n.value}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.label}</dd>
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

        <section id="trego" className="space-y-4 pb-8 pt-14 text-center">
          <p className={label}>
            {trego.period} · {trego.role}
          </p>
          <h2 className={big}>{trego.name}</h2>
          <p className="text-xl font-medium">{trego.kicker}</p>
          <p className="mx-auto max-w-lg leading-relaxed text-muted-foreground">{trego.summary}</p>
        </section>

        <section id="trego-drag">
          <DragStory
            steps={dragSteps}
            demos={{ a: <DemoSlot id="a" bare />, b: <DemoSlot id="b" bare />, c: <DemoSlot id="c" bare /> }}
          />
          <p className="mt-6 text-center">
            <Link href="/trego" className={`${link} inline-flex items-center gap-1 text-sm`}>
              Trego에서 한 설계 보기
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </p>
        </section>

        <section id="trego-nav">
          <SplitReveal
            text={
              <div className="mx-auto max-w-sm space-y-3">
                <p className={label}>탐색</p>
                <h3 className="text-2xl font-semibold tracking-tight">{trego.points[0].title}</h3>
                <p className="leading-relaxed text-muted-foreground">{trego.points[0].body}</p>
              </div>
            }
            demo={
              <Stage>
                <BreadcrumbDemo />
              </Stage>
            }
          />
        </section>

        <section id="surgiauth">
          <SplitReveal
            textSide="right"
            text={
              <div className="mx-auto max-w-md space-y-8">
                <div className="space-y-3">
                  <p className={label}>
                    {surgi.period} · {surgi.role}
                  </p>
                  <h2 className={big}>{surgi.name}</h2>
                  <p className="text-xl font-medium">{surgi.kicker}</p>
                </div>
                {surgiPairs.map((p) => (
                  <div key={p.decision} className="space-y-2">
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.problem}</p>
                    <p className="font-medium leading-relaxed">{p.decision}</p>
                  </div>
                ))}
              </div>
            }
            demo={
              <Stage>
                <CoverageGrid />
              </Stage>
            }
          />
          <ScrollReveal className="pb-12">
            <Notes items={surgiNotes} />
          </ScrollReveal>
        </section>

        <section id="contact" className="py-14">
          <ExpandStage className="rounded-[20px] bg-stage px-6 py-20 sm:py-28">
            <ScrollReveal className="space-y-6 text-center">
              <h2 className={big}>연락처</h2>
              <div className="space-y-1 text-lg">
                {site.email && <CopyLink text={site.email} />}
                <p>
                  <a href={site.github} target="_blank" rel="noopener noreferrer" className={link}>
                    GitHub
                  </a>
                </p>
              </div>
              <p className={label}>{stack.join(" · ")}</p>
              <p className="text-sm text-muted-foreground">{education}</p>
            </ScrollReveal>
          </ExpandStage>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import { dragSteps, education, projects, stack, surgiNotes, surgiPairs, type Note } from "@/config/content";
import { site } from "@/config/site";
import { BreadcrumbDemo } from "@/features/interaction-demos/components/breadcrumb-demo";
import { CopyLink } from "@/features/interaction-demos/components/copy-link";
import { CoverageGrid } from "@/features/interaction-demos/components/coverage-grid";
import { DragStory } from "@/features/interaction-demos/components/drag-story";
import { SplitReveal } from "@/features/interaction-demos/components/split-reveal";
import { PathBar } from "@/features/variant-story/components/path-bar";

const [trego, surgi] = projects;
const big = "text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em]";
const label = "font-mono text-xs text-muted-foreground";
const link =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const entries = [
  { id: "intro", path: [] },
  { id: "trego", path: [] },
  { id: "trego-drag", path: ["Trego"] },
  { id: "trego-nav", path: ["Trego"] },
  { id: "surgiauth", path: [] },
  { id: "contact", path: [] },
] as const;

// 구간마다 데모가 가장 큰 요소가 되도록 회색 무대 하나에 올린다.
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] bg-stage p-6 sm:p-8">{children}</div>;
}

// 무대 아래에 실제 구현에서 나온 수치를 붙인다. 값이 없으면 그리지 않는다.
function Notes({ items }: { items: readonly Note[] }) {
  if (!items.length) return null;
  // 하나뿐이면 격자에서 한 칸만 차서 외로워 보인다. 가운데로 모은다.
  const single = items.length === 1;
  return (
    <dl className={single ? "mx-auto mt-8 max-w-md text-center" : "mt-8 grid gap-6 sm:grid-cols-3"}>
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
      <PathBar name={site.name} entries={entries} />

      <div className="mx-auto max-w-[1100px] px-4">
        <section id="intro" className="flex min-h-[80vh] flex-col items-center justify-center py-20 text-center">
          <h1 className={big}>
            {site.name}은 인터랙션을
            <br />
            만드는 프론트엔드
            <br />
            개발자예요.
          </h1>
          <p className="mx-auto mt-8 max-w-md leading-relaxed text-muted-foreground">
            아래로 스크롤해 보세요. 위쪽 경로 바가 지금 어디인지 따라와요. 현재 위치는 빼고
            상위 위치만 보여 줘요. Trego에서 만든 규칙이에요.
          </p>
        </section>

        <section id="trego" className="space-y-4 py-20 text-center">
          <p className={label}>
            {trego.period} · {trego.role}
          </p>
          <h2 className={big}>{trego.name}</h2>
          <p className="text-xl font-medium">{trego.kicker}</p>
          <p className="mx-auto max-w-lg leading-relaxed text-muted-foreground">{trego.summary}</p>
        </section>

        <section id="trego-drag">
          <DragStory steps={dragSteps} />
          <p className="mt-6 text-center">
            <Link href="/dnd" className={`${link} text-sm`}>
              버전별 과정 전체 보기 →
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
                <div className="mx-auto max-w-md rounded-xl bg-card p-6">
                  <BreadcrumbDemo />
                </div>
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
          <div className="pb-28">
            <Notes items={surgiNotes} />
          </div>
        </section>

        <section id="contact" className="space-y-6 py-28 text-center">
          <h2 className={big}>이야기해요.</h2>
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
        </section>
      </div>
    </div>
  );
}

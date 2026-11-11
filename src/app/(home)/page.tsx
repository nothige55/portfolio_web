import Link from "next/link";
import { dragSteps, education, projects, stack } from "@/config/content";
import { site } from "@/config/site";
import { BreadcrumbDemo } from "@/features/interaction-demos/components/breadcrumb-demo";
import { CopyLink } from "@/features/interaction-demos/components/copy-link";
import { CoverageGrid } from "@/features/interaction-demos/components/coverage-grid";
import { DragStory } from "@/features/interaction-demos/components/drag-story";
import { PathBar } from "@/features/variant-story/components/path-bar";

const [trego, surgi] = projects;
const big = "text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.035em]";
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

export default function V4Page() {
  return (
    <div
      className="min-h-screen pb-32 pt-11"
      style={
        {
          "--background": "oklch(0.975 0.004 100)",
          "--foreground": "oklch(0.18 0 0)",
          "--card": "oklch(1 0 0)",
          "--muted": "oklch(0.95 0.004 100)",
          "--muted-foreground": "oklch(0.5 0 0)",
          "--border": "oklch(0.9 0.004 100)",
          "--primary": "oklch(0.55 0.2 260)",
          "--ring": "oklch(0.55 0.2 260)",
          background: "var(--background)",
          color: "var(--foreground)",
        } as React.CSSProperties
      }
    >
      <PathBar name={site.name} entries={entries} />

      <div className="mx-auto max-w-[1100px] px-4">
        <section id="intro" className="flex min-h-[80vh] flex-col justify-center py-20">
          <h1 className={big}>
            {site.name}은 인터랙션을
            <br />
            만드는 프론트엔드
            <br />
            개발자예요.
          </h1>
          <p className="mt-8 max-w-md leading-relaxed text-muted-foreground">
            아래로 스크롤해 보세요. 위쪽 경로 바가 지금 어디인지 따라와요. 현재 위치는 빼고
            상위 위치만 보여 줘요. Trego에서 만든 규칙이에요.
          </p>
        </section>

        <section id="trego" className="space-y-4 py-20">
          <p className={label}>
            {trego.period} · {trego.role}
          </p>
          <h2 className={big}>{trego.name}</h2>
          <p className="text-xl font-medium">{trego.kicker}</p>
          <p className="max-w-lg leading-relaxed text-muted-foreground">{trego.summary}</p>
        </section>

        <section id="trego-drag">
          <DragStory steps={dragSteps} />
          <Link href="/dnd" className={`${link} mt-8 inline-block text-sm`}>
            버전별 과정 전체 보기 →
          </Link>
        </section>

        <section id="trego-nav" className="grid gap-10 py-28 lg:grid-cols-2">
          <div className="space-y-3 self-center">
            <p className={label}>탐색</p>
            <h3 className="text-2xl font-semibold tracking-tight">{trego.points[0].title}</h3>
            <p className="max-w-sm leading-relaxed text-muted-foreground">{trego.points[0].body}</p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <BreadcrumbDemo />
          </div>
        </section>

        <section id="surgiauth" className="grid gap-10 py-28 lg:grid-cols-2">
          <div className="space-y-4 self-center">
            <p className={label}>
              {surgi.period} · {surgi.role}
            </p>
            <h2 className={big}>{surgi.name}</h2>
            <p className="text-xl font-medium">{surgi.kicker}</p>
            <p className="max-w-md leading-relaxed text-muted-foreground">{surgi.summary}</p>
            <h3 className="pt-4 text-lg font-semibold tracking-tight">수집 단계에서 품질을 잡았어요</h3>
            <ul className="max-w-md list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>MediaPipe Gesture Recognizer가 open palm으로 판정한 프레임만 담아서 오제스처를 막았어요.</li>
              <li>각도는 인식이 유지되는 범위 안에서만 받아요. roll ±25°(칸 폭 10°), pitch ±27°(칸 폭 18°)예요.</li>
              <li>open palm 30장을 5×3 격자에 칸마다 2장씩 모아 자세가 한쪽에 쏠리지 않게 했어요.</li>
              <li>처음에는 범위를 ±90°로 뒀는데 실제로는 가운데 줄 3칸만 찼어요. 인식이 유지되는 한도를 재서 좁혔어요.</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className={`${label} mb-4`}>카메라 없이 스크롤(세로는 pitch, Shift+스크롤은 roll)이나 손잡이로 손을 기울여 보세요</p>
            <CoverageGrid />
          </div>
        </section>

        <section id="contact" className="space-y-6 py-28">
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

import type { Metadata } from "next";
import Link from "next/link";
import { education, projects, stack } from "@/config/content";
import { site } from "@/config/site";
import { BreadcrumbDemo } from "@/features/interaction-demos/components/breadcrumb-demo";
import { SortableDemo } from "@/features/interaction-demos/components/sortable-demo";
import { CopyLink } from "@/features/variant-strip/components/copy-link";
import { CursorCircle } from "@/features/variant-strip/components/cursor-circle";
import { FilmStrip } from "@/features/variant-strip/components/film-strip";

export const metadata: Metadata = { title: "V4 필름 스트립" };

const [trego, surgi] = projects;
const big = "text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.035em]";
const small = "text-sm leading-relaxed text-neutral-600";
const link = "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const lines = [
  `${site.name}은`,
  "인터랙션을 만드는",
  "프론트엔드 개발자예요.",
  "Trego와 SurgiAuth를",
  "만들었어요.",
];

const panels = [
  {
    label: "소개",
    node: (
      <CursorCircle>
        <h1 className={big}>
          {lines.map((l, i) => (
            <span key={l} className={`block ${i % 2 ? "pl-[1.1em]" : ""}`}>
              {l}
            </span>
          ))}
        </h1>
        <p className="mt-8 font-mono text-xs text-neutral-500">스크롤하면 옆으로 넘어가요 →</p>
      </CursorCircle>
    ),
  },
  {
    label: "Trego",
    node: (
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-neutral-500">
            {trego.period} · {trego.role}
          </p>
          <h2 className={`${big} mt-4`}>{trego.name}</h2>
          <p className="mt-2 text-lg font-medium">{trego.kicker}</p>
          <p className={`${small} mt-4 max-w-md`}>{trego.summary}</p>
        </div>
        <Link href="/dnd" className={`${link} self-start text-sm`}>
          드래그가 세 번 바뀐 과정 보기 →
        </Link>
      </div>
    ),
  },
  {
    label: "드래그",
    node: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">놓일 자리가 붙는 드래그</h2>
        <SortableDemo />
      </div>
    ),
  },
  {
    label: "탐색",
    node: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{trego.points[0].title}</h2>
        <BreadcrumbDemo />
      </div>
    ),
  },
  {
    label: "SurgiAuth",
    node: (
      <div className="space-y-4">
        <p className="font-mono text-xs text-neutral-500">
          {surgi.period} · {surgi.role}
        </p>
        <h2 className={big}>{surgi.name}</h2>
        <p className="text-lg font-medium">{surgi.kicker}</p>
        <p className={`${small} max-w-md`}>{surgi.summary}</p>
        <p className="font-mono text-xs text-neutral-500">MediaPipe 손 추적 · Electron 단말 앱</p>
      </div>
    ),
  },
  {
    label: "연락",
    node: (
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-2 text-lg font-medium">
          {site.email && <CopyLink text={site.email} />}
          <p>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className={link}>
              GitHub
            </a>
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs leading-relaxed text-neutral-500">{stack.join(" · ")}</p>
          <p className={small}>{education}</p>
        </div>
      </div>
    ),
  },
];

export default function V4Page() {
  return (
    <div
      className="min-h-screen font-sans text-black"
      style={
        {
          "--background": "#ededed",
          "--foreground": "#000",
          "--card": "#fff",
          "--muted": "oklch(0.96 0 0)",
          "--muted-foreground": "oklch(0.45 0 0)",
          "--border": "oklch(0.88 0 0)",
          "--primary": "oklch(0.82 0.12 250)",
          "--ring": "oklch(0.55 0.2 260)",
          background: "var(--background)",
        } as React.CSSProperties
      }
    >
      <FilmStrip panels={panels} />
    </div>
  );
}

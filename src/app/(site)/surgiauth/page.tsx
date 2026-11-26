import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import {
  projects,
  stableAuthNotes,
  surgiNotes,
  surgiPairs,
  surgiStories,
  surgiTeam,
} from "@/config/content";
import { site } from "@/config/site";
import { PathBar } from "@/features/variant-story/components/path-bar";
import { StorySection } from "@/features/variant-story/components/story-section";
import { TocRail, type TocItem } from "@/features/variant-story/components/toc-rail";

export const metadata: Metadata = { title: "SurgiAuth" };

const [, surgi] = projects;
const section = "mx-auto max-w-[680px] space-y-4 py-12 leading-relaxed";

// 상단 경로 막대와 오른쪽 목차가 같이 쓰는 구간 목록.
const toc: TocItem[] = [
  { id: "tracking", label: "손 추적", depth: 0 },
  { id: "auth", label: "인증 확정", depth: 0 },
  { id: "gesture", label: "손 모양 수집", depth: 0 },
  { id: "device", label: "분리 창과 기기 단위 잠금", depth: 0 },
  { id: "role", label: "역할", depth: 0 },
];
const entries = [
  { id: "top", path: [] },
  ...toc.map((t) => ({ id: t.id, path: ["SurgiAuth"] })),
];

export default function SurgiAuthPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <PathBar name={site.name} entries={entries} />
      <TocRail items={toc} />
      <div id="top" className="mx-auto max-w-[680px] space-y-4 py-16">
        {/* 홈 SurgiAuth 구간과 같은 순서·스타일: 기간·역할 → 이름 → 한 줄 소개 → 요약 */}
        <p className="font-mono text-xs text-muted-foreground">
          {surgi.period} · {surgi.role}
        </p>
        <h1 className="text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em]">
          {surgi.name}
        </h1>
        <p className="text-xl font-medium">{surgi.kicker}</p>
        <p className="leading-relaxed text-muted-foreground">
          {surgi.summary}
        </p>
      </div>

      <StorySection id="tracking" title="손 추적" story={surgiStories.tracking} />

      <Separator />
      <StorySection id="auth" title="인증 확정" story={surgiStories.auth}>
        <dl className="grid gap-6 pt-2 sm:grid-cols-3">
          {stableAuthNotes.map((n) => (
            <div key={n.value}>
              <dt className="text-lg font-semibold tabular-nums">{n.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{n.label}</dd>
            </div>
          ))}
        </dl>
      </StorySection>

      <Separator />
      <StorySection id="gesture" title="손 모양 수집" story={surgiStories.gesture}>
        <div className="space-y-6 pt-2">
          {surgiPairs.map((p) => (
            <div key={p.decision} className="space-y-1">
              <p className="text-sm text-muted-foreground">{p.problem}</p>
              <p className="font-medium">{p.decision}</p>
            </div>
          ))}
          <dl className="grid gap-6 sm:grid-cols-3">
            {surgiNotes.map((n) => (
              <div key={n.value}>
                <dt className="text-lg font-semibold tabular-nums">{n.value}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{n.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </StorySection>

      <Separator />
      <StorySection id="device" title="분리 창과 기기 단위 잠금" story={surgiStories.device} />

      <Separator />
      <section id="role" className={section}>
        <h2 className="font-heading text-2xl font-bold">역할</h2>
        <ul className="list-disc space-y-2 pl-5">
          {surgiTeam.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import {
  projects,
  stateNotes,
  syncLinks,
  tregoStories,
  tregoTeam,
  type Story,
} from "@/config/content";
import { ChapterSection } from "@/features/dnd/components/chapter-section";
import { chapters, dragProblems } from "@/features/dnd/config/chapters";
import { site } from "@/config/site";
import { PathBar } from "@/features/variant-story/components/path-bar";

export const metadata: Metadata = { title: "Trego" };

const [trego] = projects;
const link =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const section = "mx-auto max-w-[680px] space-y-4 py-12 leading-relaxed";
const label = "block text-sm text-muted-foreground";

// 홈과 같은 상단 경로 막대. 드래그 단계 안에서는 "드래그 앤 드롭"이 조상으로 붙는다.
const entries = [
  { id: "top", path: [] },
  { id: "drag-intro", path: ["Trego"] },
  ...chapters.map((c) => ({
    id: `chapter-${c.id}`,
    path: ["Trego", "드래그 앤 드롭"],
  })),
  ...["nav", "state", "sync", "role"].map((id) => ({
    id,
    path: ["Trego"],
  })),
];

function StorySection({
  id,
  title,
  story,
  children,
}: {
  id: string;
  title: string;
  story: Story;
  children?: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-8 ${section}`}>
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      <p>
        <span className={label}>문제</span>
        {story.problem}
      </p>
      <div>
        <span className={label}>대안</span>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {story.rejected.map((r) => (
            <li key={r.option}>
              <span className="font-medium">{r.option}</span>: {r.reason}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <span className={label}>설계</span>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {story.design.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      {children}
      {story.process && (
        <p>
          <span className={label}>과정</span>
          {story.process}
        </p>
      )}
      {story.note && (
        <p className="text-sm text-muted-foreground">{story.note}</p>
      )}
      <p>
        <span className={label}>한계</span>
        {story.limit}
      </p>
    </section>
  );
}

export default function TregoPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <PathBar name={site.name} entries={entries} />
      <div id="top" className="mx-auto max-w-[680px] space-y-4 py-16">
        {/* 홈 Trego 구간과 같은 순서·스타일: 기간·역할 → 이름 → 한 줄 소개 → 요약 */}
        <p className="font-mono text-xs text-muted-foreground">
          {trego.period} · {trego.role}
        </p>
        <h1 className="text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em]">
          {trego.name}
        </h1>
        <p className="text-xl font-medium">{trego.kicker}</p>
        <p className="leading-relaxed text-muted-foreground">
          {trego.summary} 원본(trego-frontend)과 이를 TypeScript로 다시 구현한
          버전(trego-web-portfolio)에서 한 작업을 정리했습니다.
        </p>
      </div>

      <section id="drag" className="scroll-mt-8">
        <div
          id="drag-intro"
          className="mx-auto max-w-[680px] space-y-4 leading-relaxed"
        >
          <h2 className="font-heading text-2xl font-bold">
            계층 트리 드래그 앤 드롭
          </h2>
          <p>
            일정 트리의 드래그 앤 드롭은 평면 목록의 순서 변경과 세 가지가
            다릅니다.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {dragProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>
            목표는 드롭하기 전에 결과를 예측할 수 있게 하는 것이었습니다. 드롭
            판정 방식을 10번 가까이 바꿨고, 크게 세 단계로 나뉩니다. 단계별
            동작은{" "}
            <Link href="/#trego-drag" className={link}>
              홈 데모
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </div>
        {chapters.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </section>

      <Separator />
      <StorySection
        id="nav"
        title={trego.points[0].title}
        story={tregoStories.nav}
      >
        <p>
          <Link href="/#trego-nav" className={`${link} text-sm`}>
            홈 데모 보기
          </Link>
        </p>
      </StorySection>

      <Separator />
      <StorySection
        id="state"
        title={trego.points[2].title}
        story={tregoStories.state}
      >
        <dl className="grid gap-6 pt-2 sm:grid-cols-3">
          {stateNotes.map((n) => (
            <div key={n.value}>
              <dt className="text-lg font-semibold tabular-nums">{n.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{n.label}</dd>
            </div>
          ))}
        </dl>
      </StorySection>

      <Separator />
      <StorySection
        id="sync"
        title={trego.points[3].title}
        story={tregoStories.sync}
      >
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {syncLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              {l.label}
            </a>
          ))}
        </p>
      </StorySection>

      <Separator />
      <section id="role" className={section}>
        <h2 className="font-heading text-2xl font-bold">역할</h2>
        <ul className="list-disc space-y-2 pl-5">
          {tregoTeam.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

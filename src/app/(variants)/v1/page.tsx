import type { Metadata } from "next";
import { approach, education, projects, stack } from "@/config/content";
import { site } from "@/config/site";
import { ContactCopy } from "@/features/variant-editorial/components/contact-copy";
import { WorkList } from "@/features/variant-editorial/components/work-list";

export const metadata: Metadata = { title: "V1 에디토리얼" };

const works = [
  {
    id: "dnd",
    title: "드래그 하나를 세 번 다시 만들었어요",
    meta: "Trego · DnD",
    blurb: "같은 동작을 삽입선, 자석 미리보기, 앱 전체 반응으로 바꿔 온 과정이에요.",
    href: "/dnd",
  },
  {
    id: "breadcrumb",
    title: "스크롤 중에도 위치를 잃지 않는 탐색",
    meta: "Trego · 탐색 UX",
    blurb: projects[0].points[0].body,
  },
  {
    id: "surgiauth",
    title: projects[1].kicker,
    meta: "SurgiAuth · 졸업작품",
    blurb: projects[1].summary,
  },
] as const;

export default function V1Page() {
  return (
    <div
      className="min-h-screen pb-28"
      style={
        {
          "--background": "oklch(0.975 0.012 85)",
          "--foreground": "oklch(0.22 0.02 60)",
          "--muted-foreground": "oklch(0.5 0.02 60)",
          "--border": "oklch(0.85 0.02 80)",
          "--card": "oklch(0.995 0.005 85)",
          background: "var(--background)",
          color: "var(--foreground)",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-[640px] px-4">
        <header className="flex items-baseline justify-between py-8">
          <span className="font-heading font-bold">{site.name}</span>
          <span className="font-mono text-xs text-muted-foreground">프론트엔드 개발자</span>
        </header>

        <section className="py-20">
          <h1 className="font-heading text-4xl font-bold leading-snug sm:text-5xl">
            만져 보면 알 수 있는
            <br />
            인터랙션을 만들어요.
          </h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">{approach}</p>
        </section>

        <section aria-labelledby="works" className="space-y-4">
          <h2 id="works" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            작업
          </h2>
          <WorkList works={works} />
        </section>

        <section className="mt-16 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">스택</h2>
          <p className="leading-relaxed">{stack.join(" · ")}</p>
          <p className="text-sm text-muted-foreground">{education}</p>
        </section>

        <section className="mt-16 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">연락</h2>
          <p className="flex flex-wrap gap-x-6 gap-y-1">
            {site.email && <ContactCopy email={site.email} />}
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              GitHub
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

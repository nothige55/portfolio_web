import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { projects, stateNotes, syncLinks } from "@/config/content";
import { ChapterSection } from "@/features/dnd/components/chapter-section";
import { appOnly, chapters } from "@/features/dnd/config/chapters";

export const metadata: Metadata = { title: "Trego" };

const [trego] = projects;
const link =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const section = "mx-auto max-w-[680px] space-y-4 py-12 leading-relaxed";

export default function TregoPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <div className="mx-auto max-w-[680px] space-y-4 py-16">
        <h1 className="font-heading text-3xl font-bold">Trego에서 한 설계</h1>
        <p className="leading-relaxed text-muted-foreground">
          {trego.summary} 만들면서 부딪힌 문제와 그때 고른 설계를 정리했어요.
        </p>
      </div>

      <section id="drag" className="scroll-mt-8">
        <div className="mx-auto max-w-[680px] space-y-4">
          <h2 className="font-heading text-2xl font-bold">드래그 하나를 세 번 다시 만들었어요</h2>
          <p className="text-muted-foreground">
            같은 동작인데 사용자가 느끼는 것이 어떻게 달라졌는지가 기준이었어요. 단계별 코드를 가져온
            데모는{" "}
            <Link href="/#trego-drag" className={link}>
              홈에서 직접 끌어 볼 수 있어요
            </Link>
            .
          </p>
        </div>
        {chapters.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </section>

      <Separator />
      <section id="nav" className={`scroll-mt-8 ${section}`}>
        <h2 className="font-heading text-2xl font-bold">{trego.points[0].title}</h2>
        <p>{trego.points[0].body}</p>
        <p>
          <Link href="/#trego-nav" className={`${link} text-sm`}>
            홈에서 스크롤해 보기
          </Link>
        </p>
      </section>

      <Separator />
      <section id="state" className={`scroll-mt-8 ${section}`}>
        <h2 className="font-heading text-2xl font-bold">{trego.points[2].title}</h2>
        <p>{trego.points[2].body}</p>
        <dl className="grid gap-6 pt-2 sm:grid-cols-3">
          {stateNotes.map((n) => (
            <div key={n.value}>
              <dt className="text-lg font-semibold tabular-nums">{n.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{n.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Separator />
      <section id="sync" className={`scroll-mt-8 ${section}`}>
        <h2 className="font-heading text-2xl font-bold">{trego.points[3].title}</h2>
        <p>{trego.points[3].body}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {syncLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
              {l.label}
            </a>
          ))}
        </p>
      </section>

      <Separator />
      <section className={section}>
        <h2 className="font-heading text-2xl font-bold">그 밖에 Trego에서</h2>
        <ul className="space-y-4">
          {appOnly.map((item) => (
            <li key={item.title}>
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.body}</p>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={`${link} text-sm`}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

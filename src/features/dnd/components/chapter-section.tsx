import { Badge } from "@/components/ui/badge";
import type { Chapter } from "../config/chapters";
import { DemoSlot } from "./demo-slot";

export function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section id={`chapter-${chapter.id}`} className="scroll-mt-8 space-y-6 py-12">
      <div className="mx-auto max-w-[680px] space-y-3">
        <Badge variant="secondary">{chapter.versions}</Badge>
        <h2 className="font-heading text-2xl font-bold">{chapter.title}</h2>
      </div>
      <DemoSlot versions={chapter.versions} />
      <div className="mx-auto max-w-[680px] space-y-4 leading-relaxed">
        <p>
          <span className="block text-sm text-muted-foreground">사용자가 느끼는 것</span>
          {chapter.feel}
        </p>
        <p>
          <span className="block text-sm text-muted-foreground">바뀐 이유</span>
          {chapter.reason}
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="관련 커밋">
          {chapter.commits.map((hash) => (
            <li key={hash}>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{hash}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import type { Chapter } from "../config/chapters";

export function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section id={`chapter-${chapter.id}`} className="scroll-mt-8 space-y-6 py-12">
      <div className="mx-auto max-w-[680px] space-y-3">
        <Badge variant="secondary">{chapter.versions}</Badge>
        <h3 className="font-heading text-xl font-bold">{chapter.title}</h3>
      </div>
      <div className="mx-auto max-w-[680px] space-y-4 leading-relaxed">
        <p>
          <span className="block text-sm text-muted-foreground">사용자가 느끼는 것</span>
          {chapter.feel}
        </p>
        <p>
          <span className="block text-sm text-muted-foreground">바뀐 이유</span>
          {chapter.reason}
        </p>
        {chapter.design && (
          <div>
            <span className="block text-sm text-muted-foreground">Trego에서의 설계</span>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {chapter.design.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
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

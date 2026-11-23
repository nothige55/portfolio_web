import { Badge } from "@/components/ui/badge";
import type { Chapter } from "../config/chapters";

export function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section id={`chapter-${chapter.id}`} className="scroll-mt-8 space-y-6 py-12">
      <div className="mx-auto max-w-[680px] space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{chapter.versions}</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">{chapter.period}</span>
        </div>
        <h3 className="font-heading text-xl font-bold">{chapter.title}</h3>
      </div>
      <div className="mx-auto max-w-[680px] space-y-4 leading-relaxed">
        <div>
          <span className="block text-sm text-muted-foreground">구현</span>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {chapter.did.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <p>
          <span className="block text-sm text-muted-foreground">한계</span>
          {chapter.limit}
        </p>
      </div>
    </section>
  );
}

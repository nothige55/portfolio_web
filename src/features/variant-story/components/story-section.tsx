import type { ReactNode } from "react";
import type { Story } from "@/config/content";

const section = "mx-auto max-w-[680px] space-y-4 py-12 leading-relaxed";
const label = "block text-sm text-muted-foreground";

// /trego와 /surgiauth가 같이 쓰는 글 절. 대안·한계는 근거가 있을 때만 그린다.
export function StorySection({
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
      {story.rejected && (
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
      )}
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
      {story.limit && (
        <p>
          <span className={label}>한계</span>
          {story.limit}
        </p>
      )}
    </section>
  );
}

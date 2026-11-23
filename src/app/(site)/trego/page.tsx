import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ChapterSection } from "@/features/dnd/components/chapter-section";
import { appOnly, chapters } from "@/features/dnd/config/chapters";

export const metadata: Metadata = { title: "Trego" };

export default function DndPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <div className="mx-auto max-w-[680px] space-y-4 py-16">
        <h1 className="font-heading text-3xl font-bold">Trego에서 드래그 하나를 세 번 다시 만들었어요</h1>
        <p className="leading-relaxed text-muted-foreground">
          Trego의 일정 트리에서 드래그를 세 번 다시 만들었어요. 아래 데모는 각 버전의 코드를 가져와
          같은 과제를 풀게 한 거예요. 8/14의 동문시장을 8/12의 공항과 이호테우 사이로 옮기는 일이고,
          같은 동작인데 사용자가 느끼는 것이 어떻게 달라졌는지 봐 주세요.
        </p>
      </div>
      {chapters.map((chapter, index) => (
        <div key={chapter.id}>
          {index > 0 && <Separator />}
          <ChapterSection chapter={chapter} />
        </div>
      ))}
      <Separator />
      <section className="mx-auto max-w-[680px] space-y-4 py-12 leading-relaxed">
        <h2 className="font-heading text-2xl font-bold">그 밖에 Trego에서</h2>
        <p className="text-muted-foreground">데모에는 담지 못했지만 Trego에서 만든 것이에요.</p>
        <ul className="space-y-4">
          {appOnly.map((item) => (
            <li key={item.title}>
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.body}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

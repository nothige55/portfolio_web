import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ChapterSection } from "@/features/dnd/components/chapter-section";
import { chapters } from "@/features/dnd/config/chapters";

export const metadata: Metadata = { title: "DnD" };

export default function DndPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <div className="mx-auto max-w-[680px] space-y-4 py-16">
        <h1 className="font-heading text-3xl font-bold">드래그 하나를 세 번 다시 만들었어요</h1>
        <p className="leading-relaxed text-muted-foreground">
          모든 버전이 같은 과제를 풉니다. 8/14의 동문시장을 8/12의 공항과 이호테우 사이로 옮기는
          일이에요. 같은 동작인데 사용자가 느끼는 것이 어떻게 달라졌는지 봐 주세요.
        </p>
      </div>
      {chapters.map((chapter, index) => (
        <div key={chapter.id}>
          {index > 0 && <Separator />}
          <ChapterSection chapter={chapter} />
        </div>
      ))}
    </div>
  );
}

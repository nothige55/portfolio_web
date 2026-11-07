import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChapterTeaser } from "@/features/dnd/components/chapter-teaser";
import { chapters } from "@/features/dnd/config/chapters";
import { Intro } from "@/features/profile/components/intro";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <Intro />
      <section className="space-y-6">
        <h2 className="font-heading text-xl font-bold">드래그 하나를 세 번 다시 만들었어요</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {chapters.map((chapter) => (
            <ChapterTeaser key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </section>
      <div className="mt-12">
        <Link href="/about" className={buttonVariants({ variant: "outline" })}>
          소개 보기
        </Link>
      </div>
    </div>
  );
}

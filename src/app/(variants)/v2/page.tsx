import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { education, projects, stack } from "@/config/content";
import { site } from "@/config/site";
import { BreadcrumbDemo } from "@/features/variant-playground/components/breadcrumb-demo";
import { GestureCard } from "@/features/variant-playground/components/gesture-card";
import { SortableDemo } from "@/features/variant-playground/components/sortable-demo";

export const metadata: Metadata = { title: "V2 플레이그라운드" };

export default function V2Page() {
  return (
    <div
      className="min-h-screen pb-28"
      style={
        {
          "--primary": "oklch(0.62 0.22 35)",
          "--ring": "oklch(0.62 0.22 35)",
          "--background": "oklch(0.97 0.01 95)",
          background:
            "radial-gradient(60rem 30rem at 80% -10%, oklch(0.9 0.08 60 / 0.5), transparent), var(--background)",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-[1100px] px-4">
        <header className="flex items-center justify-between py-6">
          <span className="font-heading font-bold">{site.name}</span>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            GitHub
          </a>
        </header>

        <section className="py-14">
          <Badge variant="secondary">직접 해 보는 포트폴리오</Badge>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-6xl">
            설명 대신,
            <br />
            <span className="text-primary">만져 보세요.</span>
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            아래 카드는 전부 실제로 동작해요. 끌고, 스크롤하고, 눌러 보세요.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">놓일 자리가 붙는 드래그</CardTitle>
              <p className="text-xs text-muted-foreground">Trego · 드래그 V4의 감각을 작게 다시 만들었어요</p>
            </CardHeader>
            <CardContent>
              <SortableDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">위치를 잃지 않는 탐색</CardTitle>
              <p className="text-xs text-muted-foreground">Trego · 스크롤 breadcrumb (단순화한 재현)</p>
            </CardHeader>
            <CardContent>
              <BreadcrumbDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{projects[1].kicker}</CardTitle>
              <p className="text-xs text-muted-foreground">SurgiAuth · 졸업작품 · {projects[1].role}</p>
            </CardHeader>
            <CardContent>
              <GestureCard />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">쓰는 도구</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {stack.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{education}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

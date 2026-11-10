"use client";

import { useEffect, useState } from "react";
import { SortableDemo } from "./sortable-demo";

type Step = { id: string; versions: string; title: string; body: string; mode: "line" | "magnet" };

// 왼쪽 글을 스크롤하면 오른쪽 같은 목록의 드래그 표시가 바뀐다. 같은 과제를 버전마다 다시 풀어 보이는 장치다.
export function DragStory({ steps }: { steps: readonly Step[] }) {
  const [active, setActive] = useState(steps[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("step-", ""));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.forEach((s) => {
      const el = document.getElementById(`step-${s.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [steps]);

  const current = steps.find((s) => s.id === active) ?? steps[0];

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="order-2 lg:order-1">
        {steps.map((s) => (
          <div
            key={s.id}
            id={`step-${s.id}`}
            className={`flex min-h-[50vh] flex-col justify-center transition-opacity duration-500 lg:min-h-[70vh] ${active === s.id ? "opacity-100" : "opacity-30"}`}
          >
            <p className="font-mono text-xs text-muted-foreground">{s.versions}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="order-1 self-start lg:sticky lg:top-28 lg:order-2">
        <div className="rounded-xl border bg-card p-6">
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            같은 과제 · {current.versions}
          </p>
          <SortableDemo key={current.mode} mode={current.mode} />
        </div>
      </div>
    </div>
  );
}

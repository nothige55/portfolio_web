"use client";

import { useEffect, useState } from "react";
import { JejuMap } from "./jeju-map";
import { initialOrder, SortableDemo, type Preview } from "./sortable-demo";

type Step = { id: string; versions: string; title: string; body: string; mode: "line" | "magnet" };

const WIDE_STEP = "c";

// 왼쪽 글을 스크롤하면 같은 목록의 드래그 표시가 바뀌고, V5~V6 구간에서는 무대가 넓어지며 지도가 붙는다.
export function DragStory({ steps }: { steps: readonly Step[] }) {
  const [active, setActive] = useState(steps[0].id);
  const [order, setOrder] = useState(initialOrder);
  const [preview, setPreview] = useState<Preview | null>(null);

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
  const wide = active === WIDE_STEP;

  return (
    <div className="grid">
      <div className="order-2 lg:col-start-1 lg:row-start-1 lg:w-1/2">
        {steps.map((s) => (
          <div
            key={s.id}
            id={`step-${s.id}`}
            className={`flex min-h-[50vh] flex-col justify-center transition-opacity duration-500 lg:min-h-[80vh] ${active === s.id ? "opacity-100" : "opacity-30"}`}
          >
            <p className="font-mono text-xs text-muted-foreground">{s.versions}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div
        className={`pointer-events-none order-1 self-start lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28 lg:justify-self-end lg:transition-[width] lg:duration-700 lg:ease-in-out ${wide ? "lg:w-full" : "lg:w-1/2"}`}
      >
        <div className="pointer-events-auto rounded-xl border bg-card p-6 shadow-sm">
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            같은 과제 · {current.versions} · {current.title}
          </p>
          <div
            className={`grid gap-6 transition-[grid-template-columns] duration-700 ease-in-out ${wide ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0"}`}
          >
            <SortableDemo
              key={current.mode}
              mode={current.mode}
              order={order}
              onOrderChange={setOrder}
              onPreview={setPreview}
            />
            <div
              aria-hidden={!wide}
              className={`min-w-0 overflow-hidden transition-opacity duration-700 ${wide ? "opacity-100" : "hidden opacity-0 lg:block"}`}
            >
              <JejuMap order={order} preview={wide ? preview : null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

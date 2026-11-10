"use client";

import { useEffect, useRef, useState } from "react";
import { JejuMap } from "./jeju-map";
import { initialOrder, SortableDemo, type Preview } from "./sortable-demo";

type Step = { id: string; versions: string; title: string; body: string; mode: "line" | "magnet" };

const WIDE_STEP = "c";

// 구간에 들어서면 무대 열이 넓어지고(글 열은 좁아질 뿐 가려지지 않는다), 글을 내리면 같은 목록의 드래그 표시가 바뀐다. V5~V6에서는 지도가 붙는다.
export function DragStory({ steps }: { steps: readonly Step[] }) {
  const [active, setActive] = useState(steps[0].id);
  const [order, setOrder] = useState(initialOrder);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);

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
    // 구간 안에 있는 동안만 무대를 넓힌다. 들어올 때 커지고 나갈 때 줄어든다.
    const range = new IntersectionObserver(([e]) => setExpanded(e.isIntersecting), {
      rootMargin: "-35% 0px -35% 0px",
    });
    if (root.current) range.observe(root.current);
    return () => {
      io.disconnect();
      range.disconnect();
    };
  }, [steps]);

  const current = steps.find((s) => s.id === active) ?? steps[0];
  const wide = active === WIDE_STEP;

  return (
    <div
      ref={root}
      className={`grid gap-10 lg:transition-[grid-template-columns] lg:duration-700 lg:ease-in-out ${expanded ? "lg:grid-cols-[minmax(0,0.7fr)_minmax(0,2fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"}`}
    >
      <div className="order-2 lg:order-1">
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

      <div className="order-1 self-start lg:sticky lg:top-28 lg:order-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            같은 과제 · {current.versions} · {current.title}
          </p>
          <div
            className={`grid gap-6 lg:transition-[grid-template-columns] lg:duration-700 lg:ease-in-out ${wide ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0"}`}
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

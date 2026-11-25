import type { ReactNode } from "react";

// 데모가 무엇을 해야 하는지 알려주는 비컨+말풍선. 조작을 막지 않게 pointer-events-none이고, 숨김 판정은 데모를 감싼 쪽에서 한다.
export function DemoHint({
  text,
  icon,
  visible,
  className = "",
}: {
  text: string;
  icon: ReactNode;
  visible: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none inline-flex items-center gap-2 motion-safe:transition-opacity motion-safe:duration-300 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {/* 눈길은 점과 링만 끌고, 글자 칸은 가만히 둔다 */}
      <span aria-hidden="true" className="relative size-2.5 shrink-0">
        <span className={`absolute inset-0 rounded-full bg-brand ${visible ? "hint-ping" : ""}`} />
        <span className="absolute inset-0 rounded-full bg-brand" />
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-sm font-medium text-foreground shadow-md ring-1 ring-black/10">
        <span aria-hidden="true" className="shrink-0 text-brand-ink [&>svg]:size-4">
          {icon}
        </span>
        <span>{text}</span>
      </span>
    </div>
  );
}

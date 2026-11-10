"use client";

import { useInView } from "@/hooks/use-in-view";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"} ${className}`}
    >
      {children}
    </div>
  );
}

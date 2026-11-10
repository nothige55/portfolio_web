"use client";

import { useState } from "react";

const steps = [
  { glyph: "🖐", label: "열기" },
  { glyph: "✊", label: "쥐기" },
  { glyph: "🖐", label: "열기" },
] as const;

export function GestureCard() {
  const [step, setStep] = useState(0);
  const done = step === steps.length;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        한 번의 동작이 아니라 순서로 인증해요. 버튼을 눌러 순서대로 따라 해 보세요.
      </p>
      <ol className="flex items-center justify-center gap-3" aria-label="인증 동작 순서">
        {steps.map((s, i) => (
          <li
            key={i}
            className={`flex size-16 flex-col items-center justify-center rounded-full border text-2xl transition-all duration-300 ${i < step ? "scale-100 border-primary bg-primary/10" : i === step ? "scale-110 border-foreground" : "opacity-40"}`}
          >
            <span aria-hidden>{s.glyph}</span>
            <span className="text-[10px]">{s.label}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between text-sm" aria-live="polite">
        <span className={done ? "font-medium text-primary" : "text-muted-foreground"}>
          {done ? "인증됐어요 ✓" : `${step + 1}번째: ${steps[step].label}`}
        </span>
        <button
          type="button"
          onClick={() => setStep(done ? 0 : step + 1)}
          className="rounded-md border px-3 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {done ? "다시" : "동작했어요"}
        </button>
      </div>
    </div>
  );
}

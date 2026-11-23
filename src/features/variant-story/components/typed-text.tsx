"use client";

import { useEffect, useState } from "react";
import { jamoSteps } from "../utils/jamo-steps";

type Step = { s: number; n: number; erasing: boolean };

// words를 자모 단위로 타이핑하고 지우기를 무한 반복한다(reduced-motion이면 첫 단어에서 멈춤). prefix·suffix는 고정이고 suffix는 항상 둘째 줄에 둔다.
// 가장 긴 문장을 투명하게 깔아 높이와 너비를 고정하고, 스크린리더는 첫 단어 문장을 바로 읽는다.
// shortcut: JS가 꺼져 있으면 눈에는 문장이 안 보인다(스크린리더용 텍스트만 남음). 필요해지면 초기값을 전체 문장으로 바꾼다.
export function TypedText({
  prefix,
  words,
  suffix,
  speed = 80,
  hold = 2000,
}: {
  prefix: string;
  words: readonly string[];
  suffix: string;
  speed?: number;
  hold?: number;
}) {
  const steps = words.map(jamoSteps);
  const [step, setStep] = useState<Step>({ s: 0, n: 0, erasing: false });
  const { s, n, erasing } = step;

  useEffect(() => {
    const max = steps[s].length - 1;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setStep({ s: 0, n: steps[0].length - 1, erasing: false }), 0);
      return () => clearTimeout(id);
    }
    let delay: number;
    let next: Step;
    if (!erasing && n < max) {
      delay = speed * (0.6 + Math.random() * 0.8); // 간격을 조금씩 달리해 사람이 치는 느낌을 낸다.
      next = { s, n: n + 1, erasing };
    } else if (!erasing) {
      delay = hold;
      next = { s, n, erasing: true };
    } else if (n > 0) {
      delay = speed / 2;
      next = { s, n: n - 1, erasing };
    } else {
      delay = 250;
      next = { s: (s + 1) % steps.length, n: 0, erasing: false };
    }
    const id = setTimeout(() => setStep(next), delay);
    return () => clearTimeout(id);
    // steps는 words가 같으면 매 렌더 같은 값이라 의존성에서 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, n, erasing, speed, hold]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a));
  // 커서는 치고 지우는 동안 계속 켜져 있고, 다 쳐서 멈춰 있을 때만 깜빡인다.
  const idle = !erasing && n === steps[s].length - 1;
  // 투명 문장에도 같은 커서를 넣어야 두 문장의 줄바꿈이 같다.
  const caret = (
    <span
      className={`ml-1 inline-block h-[0.9em] w-[0.09em] translate-y-[0.1em] bg-current ${idle ? "motion-safe:animate-[typed-caret_1s_step-end_infinite]" : ""}`}
    />
  );

  return (
    <>
      <span className="sr-only">
        {prefix}
        {words[0]} {suffix}
      </span>
      <span aria-hidden className="relative block">
        <span className="invisible">
          {prefix}
          {longest}
          {caret}
          <br />
          {suffix}
        </span>
        <span className="absolute inset-0 text-left">
          {prefix}
          {steps[s][n]}
          {caret}
          <br />
          {suffix}
        </span>
      </span>
    </>
  );
}

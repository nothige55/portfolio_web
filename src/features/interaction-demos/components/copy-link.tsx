"use client";

import { useCopy } from "@/hooks/use-copy";

export function CopyLink({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="rounded-sm text-left underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? "Copied" : text}
      <span aria-live="polite" className="sr-only">
        {copied ? "복사했어요" : ""}
      </span>
    </button>
  );
}

"use client";

import { useCopy } from "@/hooks/use-copy";

export function ContactCopy({ email }: { email: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(email)}
      className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? "복사했어요 ✓" : email}
      <span aria-live="polite" className="sr-only">
        {copied ? "이메일을 복사했어요" : ""}
      </span>
    </button>
  );
}

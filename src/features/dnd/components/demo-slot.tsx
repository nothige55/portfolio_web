"use client";

import dynamic from "next/dynamic";

import type { Chapter } from "../config/chapters";

// 단계마다 dnd 코드가 따로라서 단계별 청크로 나눠 브라우저에서만 불러온다(dnd-kit은 SSR이 필요 없음)
const demos = {
  a: dynamic(() => import("../stage-a/components/stage-a-demo").then((m) => m.StageADemo), {
    ssr: false,
  }),
  b: dynamic(() => import("../stage-b/components/stage-b-demo").then((m) => m.StageBDemo), {
    ssr: false,
  }),
  c: dynamic(() => import("../stage-c/components/stage-c-demo").then((m) => m.StageCDemo), {
    ssr: false,
  }),
} satisfies Record<Chapter["id"], unknown>;

export function DemoSlot({ id }: { id: Chapter["id"] }) {
  const Demo = demos[id];
  return <Demo />;
}

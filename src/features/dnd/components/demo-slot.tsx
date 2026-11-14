"use client";

import dynamic from "next/dynamic";

import type { Chapter } from "../config/chapters";

// 불러오는 동안 데모 높이(데스크톱 실측 572/572/772px)보다 조금 작게 자리를 잡아 글이 밀리는 폭을 줄인다
// 단계마다 dnd 코드가 따로라서 단계별 청크로 나눠 브라우저에서만 불러온다(dnd-kit은 SSR이 필요 없음)
const demos = {
  a: dynamic(() => import("../stage-a/components/stage-a-demo").then((m) => m.StageADemo), {
    ssr: false,
    loading: () => <div className="min-h-[520px]" />,
  }),
  b: dynamic(() => import("../stage-b/components/stage-b-demo").then((m) => m.StageBDemo), {
    ssr: false,
    loading: () => <div className="min-h-[520px]" />,
  }),
  c: dynamic(() => import("../stage-c/components/stage-c-demo").then((m) => m.StageCDemo), {
    ssr: false,
    loading: () => <div className="min-h-[720px]" />,
  }),
} satisfies Record<Chapter["id"], unknown>;

export function DemoSlot({ id }: { id: Chapter["id"] }) {
  const Demo = demos[id];
  return <Demo />;
}

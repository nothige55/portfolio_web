"use client";

import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useState } from "react";

import type { Chapter } from "../config/chapters";
import type { DemoProps } from "../data/route-rows";
import { SharedMapSlot, useSharedRouteMap } from "./shared-route-map";

// 받아 둔 모듈은 dynamic을 거치지 않고 바로 그린다. lazy는 받아 둔 모듈에도 한 번 suspend하고,
// React가 폴백을 최소 300ms 유지해서 단계를 처음 바꿀 때 창이 비어 보였다
const loaded: Partial<Record<Chapter["id"], ComponentType<DemoProps>>> = {};
const loaders = {
  a: () => import("../stage-a/components/stage-a-demo").then((m) => (loaded.a = m.StageADemo)),
  b: () => import("../stage-b/components/stage-b-demo").then((m) => (loaded.b = m.StageBDemo)),
  c: () => import("../stage-c/components/stage-c-demo").then((m) => (loaded.c = m.StageCDemo)),
};
// 불러오는 동안 데모 높이(데스크톱 실측 572/572/772px)보다 조금 작게 자리를 잡아 글이 밀리는 폭을 줄인다
// 단계마다 dnd 코드가 따로라서 단계별 청크로 나눠 브라우저에서만 불러온다(dnd-kit은 SSR이 필요 없음)
const demos = {
  a: dynamic(loaders.a, {
    ssr: false,
    loading: () => <div className="min-h-[520px]" />,
  }),
  b: dynamic(loaders.b, {
    ssr: false,
    loading: () => <div className="min-h-[520px]" />,
  }),
  c: dynamic(loaders.c, {
    ssr: false,
    loading: () => <div className="min-h-[720px]" />,
  }),
} satisfies Record<Chapter["id"], unknown>;

// 트리 옆 지도 칸에 공유 지도를 붙이고, 트리가 바뀌면 같은 순서로 지도를 다시 그린다
export function DemoSlot({ id }: { id: Chapter["id"] }) {
  // 마운트 때 한 번만 고른다. 렌더 중에 바뀌면 컴포넌트 타입이 달라져 데모 상태가 초기화된다
  const [Demo] = useState(() => loaded[id] ?? demos[id]);
  // 다음 단계로 처음 넘어갈 때 바로 그릴 수 있게 미리 받는다
  useEffect(() => {
    Object.values(loaders).forEach((load) => void load());
  }, []);
  const shared = useSharedRouteMap();
  if (!shared) throw new Error("DemoSlot은 SharedRouteMapProvider 안에서만 쓴다");
  const { setRows, setDragPreview } = shared;
  // 이전 단계에서 드래그하다 끊긴 미리보기가 새 단계 지도에 남지 않게 지운다
  useEffect(() => setDragPreview(null), [setDragPreview]);
  return <Demo onRowsChange={setRows} onDragPreview={setDragPreview} aside={<SharedMapSlot />} />;
}

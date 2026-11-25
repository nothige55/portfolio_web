"use client";

import { createContext, type ReactNode, useContext, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { type DragPreview, type RouteRow, seedRows } from "../data/route-rows";
import { RouteMap } from "./route-map";

type SharedRouteMap = {
  readonly setRows: (rows: readonly RouteRow[]) => void;
  readonly setDragPreview: (preview: DragPreview | null) => void;
  readonly hostNode: HTMLDivElement | null;
  readonly setAttached: (attached: boolean) => void;
};

const SharedRouteMapContext = createContext<SharedRouteMap | null>(null);

export const useSharedRouteMap = () => useContext(SharedRouteMapContext);

// 지도를 단계마다 새로 만들지 않도록 Provider 수명 동안 한 번만 마운트하고, 그려진 DOM만 현재 단계의 칸으로 옮긴다
export function SharedRouteMapProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<readonly RouteRow[]>(seedRows);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  // react가 관리하지 않는 노드라 옮겨도 안전하다. 서버에는 document가 없어 null이다
  const [hostNode] = useState(() => {
    if (typeof document === "undefined") return null;
    const node = document.createElement("div");
    node.className = "h-full w-full";
    return node;
  });
  // 첫 슬롯에 붙은 뒤에만 포털을 그린다. 서버와 첫 클라이언트 렌더가 같아 hydration이 안 깨지고,
  // 문서에 붙지 않은 0×0 노드에서 Mapbox를 만들면 load가 오지 않아 오류 화면이 뜨는 것도 막는다
  const [attached, setAttached] = useState(false);

  return (
    <SharedRouteMapContext.Provider value={{ setRows, setDragPreview, hostNode, setAttached }}>
      {children}
      {hostNode && attached ? createPortal(<RouteMap rows={rows} dragPreview={dragPreview} />, hostNode) : null}
    </SharedRouteMapContext.Provider>
  );
}

// 지도 칸. react 자식을 두지 않고 hostNode만 직접 붙인다(섞이면 removeChild 오류)
export function SharedMapSlot() {
  const ctx = useSharedRouteMap();
  const slotRef = useRef<HTMLDivElement>(null);
  // context 객체는 rows가 바뀔 때마다 새로 만들어지므로, 바뀌지 않는 값만 의존해 지도를 불필요하게 떼었다 붙이지 않는다
  const host = ctx?.hostNode;
  const setAttached = ctx?.setAttached;

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot || !host || !setAttached) return;
    slot.appendChild(host);
    setAttached(true);
    return () => {
      // 다음 단계 슬롯이 이미 가져갔다면 건드리지 않는다
      if (host.parentNode === slot) slot.removeChild(host);
    };
  }, [host, setAttached]);

  // 크기 변화는 지도 컨테이너의 ResizeObserver가 처리하므로 resize를 따로 부르지 않는다
  return <div ref={slotRef} className="h-full w-full" />;
}

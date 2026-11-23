"use client";

import { useEffect, useState } from "react";

// 화면 위쪽 20~30% 띠에 걸친 구간을 현재 구간으로 본다. 상단 막대와 목차가 같이 쓴다.
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>();
  // 호출부가 매 렌더 새 배열을 넘겨도 id 목록이 같으면 다시 관찰하지 않는다.
  const key = ids.join(" ");

  useEffect(() => {
    const ids = key ? key.split(" ") : [];
    // 띠에 걸친 구간들. 현재 구간이 띠를 벗어나면 남은 구간으로, 하나도 없으면(예: 목차에 없는 맨 위 제목) 비운다.
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          const id = e.target.id;
          if (e.isIntersecting) {
            inBand.add(id);
            setActive(id);
          } else {
            inBand.delete(id);
            setActive((a) => (a === id ? [...inBand].at(-1) : a));
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [key]);

  return active;
}

"use client";

import { useEffect, useState } from "react";

// 화면 위쪽 20~30% 띠에 걸친 구간을 현재 구간으로 본다. 상단 막대와 목차가 같이 쓴다.
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  // 호출부가 매 렌더 새 배열을 넘겨도 id 목록이 같으면 다시 관찰하지 않는다.
  const key = ids.join(" ");

  useEffect(() => {
    const ids = key ? key.split(" ") : [];
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) if (e.isIntersecting) setActive(e.target.id);
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

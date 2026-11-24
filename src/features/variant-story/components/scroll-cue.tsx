"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

// 스크롤바가 없어서 아래에 내용이 더 있다는 신호를 준다. 화면 아래를 배경색으로 흐리게 지우고 그 위에 화살표를 고정한다.
// 한 번 스크롤하면 둘 다 사라진다.
export function ScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 flex h-44 items-end justify-center bg-gradient-to-t from-background from-30% to-transparent pb-10 text-brand transition-opacity duration-500 ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <ArrowDown className="size-9 motion-safe:animate-bounce" />
    </div>
  );
}

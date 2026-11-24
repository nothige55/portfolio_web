"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

// 고정(pin) 구간의 여백은 ScrollTrigger가 계산한 뒤에야 생겨서, 주소의 #구간(/about → /#about)으로 처음 내려간 위치가 어긋난다.
// 계산이 끝날 때마다 다시 맞추되, 사용자가 직접 스크롤을 시작하면 그만둔다.
export function HashScroll() {
  useEffect(() => {
    // 아래에서 주소의 해시를 지우므로 id는 처음에 한 번만 읽는다
    const id = decodeURIComponent(location.hash.slice(1));
    const go = () => {
      if (id) document.getElementById(id)?.scrollIntoView();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      ScrollTrigger.removeEventListener("refresh", go);
      events.forEach((e) => window.removeEventListener(e, stop));
      events.forEach((e) => window.removeEventListener(e, strip));
    };
    // 사용자가 직접 움직이면 해시를 지워 새로고침이 맨 위에서 시작하게 한다
    const strip = () => location.hash && history.replaceState(null, "", location.pathname + location.search);
    events.forEach((e) => window.addEventListener(e, strip, { once: true, passive: true }));
    ScrollTrigger.addEventListener("refresh", go);
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }));
    go();
    return stop;
  }, []);
  return null;
}

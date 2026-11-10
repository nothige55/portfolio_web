"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "기본" },
  { href: "/v1", label: "V1 에디토리얼" },
  { href: "/v2", label: "V2 플레이그라운드" },
  { href: "/v3", label: "V3 스크롤" },
  { href: "/v4", label: "V4 스토리" },
];

// 시안 비교용. 하나를 고르면 지운다.
export function VariantSwitcher() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="디자인 시안 전환"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full border border-white/15 bg-black/80 p-1 text-xs text-white shadow-lg backdrop-blur"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className="whitespace-nowrap rounded-full px-3 py-1.5 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white aria-[current=page]:bg-white aria-[current=page]:text-black"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

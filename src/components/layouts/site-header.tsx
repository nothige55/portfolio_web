import Link from "next/link";
import { site } from "@/config/site";

const links = [
  { href: "/", label: "홈" },
  { href: "/dnd", label: "DnD" },
  { href: "/about", label: "소개" },
];

const linkClass =
  "rounded-sm px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className={`${linkClass} font-heading text-base font-bold text-foreground`}>
          {site.name}
        </Link>
        <nav aria-label="주요 메뉴" className="flex gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

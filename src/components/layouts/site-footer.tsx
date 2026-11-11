import { site } from "@/config/site";

const linkClass =
  "rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted-foreground">
        <a href={site.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GitHub
        </a>
        {site.email && (
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>
        )}
      </div>
    </footer>
  );
}

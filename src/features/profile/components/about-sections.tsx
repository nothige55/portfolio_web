import { site } from "@/config/site";

const sections = [
  { title: "관심사", body: "인터랙션 디자인과 HCI에 관심이 있어요. 내용은 곧 채워 둘게요." },
  { title: "이력", body: "이력은 곧 채워 둘게요." },
  { title: "스택", body: "스택은 곧 채워 둘게요." },
];

const linkClass =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AboutSections() {
  return (
    <div className="mx-auto max-w-[680px] space-y-10 py-16">
      <h1 className="font-heading text-3xl font-bold">소개</h1>
      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="font-heading text-xl font-bold">{section.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{section.body}</p>
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="font-heading text-xl font-bold">연락처</h2>
        <ul className="space-y-1">
          <li>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
              GitHub
            </a>
          </li>
          {site.email && (
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

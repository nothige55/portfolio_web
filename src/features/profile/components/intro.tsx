import { site } from "@/config/site";

export function Intro() {
  return (
    <div className="max-w-[680px] space-y-4 py-16">
      <p className="text-sm text-muted-foreground">{site.name}</p>
      <h1 className="font-heading text-3xl font-bold leading-snug sm:text-4xl">{site.tagline}</h1>
    </div>
  );
}

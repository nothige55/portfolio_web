import type { Metadata } from "next";
import { site } from "@/config/site";
import { AboutSections } from "@/features/profile/components/about-sections";
import { PathBar } from "@/features/variant-story/components/path-bar";

export const metadata: Metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <PathBar name={site.name} />
      <AboutSections />
    </div>
  );
}

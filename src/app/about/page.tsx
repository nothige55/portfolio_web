import type { Metadata } from "next";
import { AboutSections } from "@/features/profile/components/about-sections";

export const metadata: Metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16">
      <AboutSections />
    </div>
  );
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: `${site.name} · 프론트엔드 개발자`, template: `%s · ${site.name}` },
  description: site.description,
  // 상대 경로 OG 이미지·URL을 절대 주소로 풀기 위해 필요하다
  metadataBase: new URL("https://jinhashin.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    title: `${site.name} · 프론트엔드 개발자`,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          본문으로 건너뛰기
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

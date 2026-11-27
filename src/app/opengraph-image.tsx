import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { site } from "@/config/site";

export const alt = "신진하 · 프론트엔드 개발자";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default async function Image() {
  // satori는 variable 폰트를 못 읽어 정적 otf를 읽는다. 경로를 통째로 적어야 배포 추적이 이 두 파일만 넣는다
  const [bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf")),
    readFile(join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-Regular.otf")),
  ]);
  const chip = (color: string, label: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 24px",
        border: "2px solid #e5e7eb",
        borderRadius: 12,
        fontSize: 28,
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: color }} />
      {label}
    </div>
  );
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#ffffff",
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#6b7280" }}>{site.name} · Frontend Developer</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            fontSize: 84,
            fontWeight: 700,
            color: "#111827",
            letterSpacing: -2,
            lineHeight: 1.15,
          }}
        >
          <div style={{ display: "flex" }}>
            어떻게&nbsp;<span style={{ color: "#0d99ff" }}>움직이는지</span>
          </div>
          <div style={{ display: "flex" }}>궁금한 UI가 많습니다.</div>
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 32, color: "#374151" }}>{site.tagline}</div>
        <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
          {chip("#0d99ff", "Trego")}
          {chip("#0d9488", "SurgiAuth")}
        </div>
        <div style={{ display: "flex", position: "absolute", right: 80, bottom: 80, fontSize: 24, color: "#9ca3af" }}>
          jinhashin.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/content";

export const dynamic = "force-static";

/** 1200×630 social share card used for Open Graph, Twitter, and structured data. */
export async function GET() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #faf9ff 0%, #ece6ff 100%)",
          color: "#231b4a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={194} height={80} />
          <div style={{ fontSize: 34, fontWeight: 700 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>
            Electrical &amp; MEP Estimating Services
          </div>
          <div style={{ fontSize: 30, color: "#4d2fc7" }}>{SITE.tagline}</div>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#6b3df4", borderRadius: 5 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

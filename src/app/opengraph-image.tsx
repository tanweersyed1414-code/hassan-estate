import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Hassan Estates with Sandhu Builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e1a14",
          backgroundImage: "linear-gradient(135deg, #17140f 0%, #2a241b 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            border: "2px solid rgba(200,117,88,0.5)",
            color: "#d5a48f",
            fontSize: 40,
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          H
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 500, color: "#ffffff" }}>Hassan Estates</div>
        <div style={{ display: "flex", fontSize: 28, color: "#d5a48f", marginTop: 8, letterSpacing: 4 }}>
          WITH SANDHU BUILDERS
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 24 }}>
          Real Estate &amp; Construction · Top City-1, Islamabad
        </div>
      </div>
    ),
    { ...size }
  );
}

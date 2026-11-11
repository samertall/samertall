import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07090c",
          color: "#f4f6f8",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#f7c948" }}>RIPPLE</div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.02, letterSpacing: -2, maxWidth: 900 }}>
          Pass it before it cools.
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9aa3b2" }}>A live board for lines that catch.</div>
      </div>
    ),
    size,
  );
}

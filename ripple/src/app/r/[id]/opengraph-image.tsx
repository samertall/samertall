import { ImageResponse } from "next/og";
import { getRippleCopy } from "@/lib/board";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const copy = await getRippleCopy(id).catch(() => null);
  const body = copy?.body ?? "Pass it before it cools.";
  const name = copy?.name ?? "Ripple";

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
        <div style={{ display: "flex", fontSize: 62, lineHeight: 1.08, letterSpacing: -1.5 }}>{body}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#9aa3b2" }}>{name}</div>
      </div>
    ),
    size,
  );
}

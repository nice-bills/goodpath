import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GoodPath: Your guided path";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#f7f6f3",
          color: "#111111",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="18" fill="#007a55" />
            <path
              d="M16 46 C16 46 22 28 32 22 C42 16 48 24 48 24"
              stroke="#f7f6f3"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="48" cy="24" r="4" fill="#f7f6f3" />
            <circle cx="32" cy="22" r="2.5" fill="#007a55" opacity={0.85} />
          </svg>
          <div
            style={{
              fontSize: 88,
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            GoodPath
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 36,
            color: "#007a55",
            letterSpacing: "-0.01em",
          }}
        >
          Your guided path
        </div>
      </div>
    ),
    { ...size },
  );
}

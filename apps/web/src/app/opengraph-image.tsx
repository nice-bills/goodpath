import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GoodPath — Mark your progress";
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
              d="M18 48 L18 40 M18 34 L18 26 M18 20 L18 14"
              stroke="#f7f6f3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="5 4"
            />
            <path
              d="M30 16 L44 24 L30 32"
              stroke="#f7f6f3"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M30 32 L44 40 L30 48"
              stroke="#f7f6f3"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="44" cy="48" r="4" fill="#f7f6f3" />
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
          Mark your progress
        </div>
      </div>
    ),
    { ...size },
  );
}

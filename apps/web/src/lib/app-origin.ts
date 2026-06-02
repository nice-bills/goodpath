/**
 * Public URL for links that must open on another device (FV callback, QR codes).
 * Set NEXT_PUBLIC_APP_URL via `pnpm dev:lan` or `pnpm dev:tunnel`.
 */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

/** localhost / 127.0.0.1 — phones cannot reach the laptop this way. */
export function isLocalOnlyOrigin(origin = getAppOrigin()): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

export function phoneAccessHint(): string {
  return "Run `pnpm dev:lan` (same WiFi) or `pnpm dev:tunnel` (HTTPS), open that URL on your laptop, then scan the QR — not localhost.";
}

import { CONVEX_URL } from "@/lib/env";

/** True when the app has a real Convex deployment URL (not the dev placeholder). */
export function isConvexConfigured(): boolean {
  const url = CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return false;
  if (url.includes("placeholder.convex.cloud")) return false;
  if (url.startsWith("http://127.0.0.1:") || url.startsWith("http://localhost:")) {
    return true;
  }
  return url.startsWith("https://") && url.includes(".convex.");
}

export const CONVEX_NOT_CONFIGURED_MESSAGE =
  "Set NEXT_PUBLIC_CONVEX_URL in apps/web/.env.local (run npx convex dev from the repo root and copy the URL).";

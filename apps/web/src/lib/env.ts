import type { contractEnv } from "@goodsdks/citizen-sdk";

function defaultApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    process.env.VERCEL_URL &&
    (process.env.NEXT_PUBLIC_GOODPATH_USE_HONO_API === "1" ||
      process.env.GOODPATH_USE_HONO_API === "1")
  ) {
    return `https://${process.env.VERCEL_URL}/goodpath-api`;
  }
  return "http://localhost:3001";
}

/** Legacy Hono mount (deprecated for app state — use Convex). */
export const API_URL = defaultApiUrl();

/** Convex deployment URL from `npx convex dev` or Vercel env. */
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
export const SDK_ENV = (process.env.NEXT_PUBLIC_GOODDOLLAR_ENV ?? "development") as contractEnv;
export const TIP_RECIPIENT = (process.env.NEXT_PUBLIC_TIP_RECIPIENT ??
  "0x0000000000000000000000000000000000000001") as `0x${string}`;
export const MIN_TIP_G = process.env.NEXT_PUBLIC_MIN_TIP_G ?? "0.01";
export const SUPPORT_RECIPIENT = (process.env.NEXT_PUBLIC_SUPPORT_RECIPIENT ??
  process.env.NEXT_PUBLIC_TIP_RECIPIENT ??
  "0x0000000000000000000000000000000000000001") as `0x${string}`;
export const MIN_SUPPORT_G =
  process.env.NEXT_PUBLIC_MIN_SUPPORT_G ??
  process.env.NEXT_PUBLIC_MIN_TIP_G ??
  "0.01";
export const MIN_DEPLOY_G = process.env.NEXT_PUBLIC_MIN_DEPLOY_G ?? "0.01";
export const STREAM_RECIPIENT = (process.env.NEXT_PUBLIC_STREAM_RECIPIENT ??
  process.env.NEXT_PUBLIC_TIP_RECIPIENT ??
  "0x0000000000000000000000000000000000000001") as `0x${string}`;
export const MIN_STREAM_G_PER_MONTH =
  process.env.NEXT_PUBLIC_MIN_STREAM_G_PER_MONTH ?? "0.01";

/** LAN / tunnel URL for phone QR and FV callbacks (see `pnpm dev:lan`). */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

/** GoodPathReceipt UUPS proxy on Celo mainnet (2.0). */
export const RECEIPT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_GOODPATH_RECEIPT_ADDRESS as `0x${string}` | undefined;

/** Show demo mode toggle + seeded profile (judging / screenshots). */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "1";

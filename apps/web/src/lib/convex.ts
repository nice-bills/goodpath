import { ConvexReactClient } from "convex/react";
import { CONVEX_URL } from "@/lib/env";

const url = CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!url && typeof window !== "undefined") {
  console.warn(
    "[goodpath] NEXT_PUBLIC_CONVEX_URL is unset — Convex queries will fail. Run `npx convex dev` and copy the URL to apps/web/.env.local",
  );
}

export const convex = new ConvexReactClient(url ?? "https://placeholder.convex.cloud");

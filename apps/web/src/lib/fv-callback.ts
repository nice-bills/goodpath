import { getAppOrigin } from "@/lib/app-origin";

/** Query params GoodDollar appends after redirect-mode face verification. */
export type FvReturnResult = {
  isVerified: boolean;
  reason?: string;
};

export function parseFvReturnParams(search: string): FvReturnResult | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw =
    params.get("isVerified") ??
    params.get("isverified") ??
    params.get("verified");
  if (raw === null) return null;

  const isVerified = raw === "true" || raw === "1";
  const reason = params.get("reason") ?? params.get("error") ?? undefined;
  return { isVerified, reason };
}

export function fvCallbackUrl(path = "/quests"): string {
  const url = new URL(path, getAppOrigin());
  url.searchParams.set("fv", "return");
  return url.toString();
}

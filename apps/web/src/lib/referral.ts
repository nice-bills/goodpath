import { APP_URL } from "@/lib/env";

const REF_KEY = "goodpath_ref";

/** Shareable onboarding link with referrer wallet. */
export function referralUrl(address: string): string {
  const base =
    APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://goodpath.app");
  const url = new URL("/", base);
  url.searchParams.set("ref", address);
  return url.toString();
}

/** Persist `?ref=` from landing URL for wallet connect (2.0). */
export function captureRefFromLocation(): void {
  if (typeof window === "undefined") return;
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (!ref || !/^0x[a-fA-F0-9]{40}$/.test(ref)) return;
  sessionStorage.setItem(REF_KEY, ref.toLowerCase());
}

export function getPendingReferrer(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REF_KEY);
}

export function clearPendingReferrer(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REF_KEY);
}

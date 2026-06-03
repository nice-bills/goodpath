import { APP_URL } from "@/lib/env";

/** Shareable onboarding link (engagement-style deep link until SDK wired). */
export function referralUrl(address: string): string {
  const base =
    APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://goodpath.app");
  const url = new URL("/", base);
  url.searchParams.set("ref", address);
  return url.toString();
}

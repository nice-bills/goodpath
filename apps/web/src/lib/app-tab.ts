import { JUDGE_DEMO } from "@/lib/env";

export type AppTab = "home" | "explore" | "quests" | "celebrate";

export const APP_TABS: AppTab[] = ["home", "explore", "quests", "celebrate"];

/** Tabs that work without a connected wallet. */
export const PUBLIC_APP_TABS: AppTab[] = ["home", "explore"];

export function parseAppTab(pathname: string, tabParam: string | null): AppTab {
  if (pathname === "/quests") return "quests";
  if (pathname === "/celebrate") return "celebrate";
  if (tabParam === "explore") return "explore";
  if (tabParam === "quests" || tabParam === "celebrate") return tabParam;
  if (pathname === "/" && JUDGE_DEMO) return "explore";
  return "home";
}

export function appTabHref(tab: AppTab, hash?: string): string {
  const base = tab === "home" ? "/" : `/?tab=${tab}`;
  if (!hash) return base;
  const fragment = hash.startsWith("#") ? hash : `#${hash}`;
  return `${base}${fragment}`;
}

/** Nav item may map to a tab plus optional quest hash (e.g. Claim → quests#claim). */
export type NavItem = {
  id: string;
  tab: AppTab;
  label: string;
  hash?: string;
};

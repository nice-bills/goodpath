"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { type AppTab, appTabHref, parseAppTab, PUBLIC_APP_TABS } from "@/lib/app-tab";
import {
  canAccessGatedTabs,
  CONNECT_TO_CONTINUE_MESSAGE,
} from "@/lib/wallet-access";

type SetTabOptions = { hash?: string };

type QuestNavFocus = "claim" | "path";

function readQuestNavFocusFromWindow(): QuestNavFocus {
  if (typeof window === "undefined") return "path";
  const raw = window.location.hash.replace(/^#/, "");
  if (raw === "claim" || raw === "quest-claim") return "claim";
  return "path";
}

type AppTabContextValue = {
  tab: AppTab;
  questNavFocus: QuestNavFocus;
  setTab: (next: AppTab, options?: SetTabOptions) => void;
  canAccessGatedTabs: boolean;
  tabGateMessage: string | null;
  clearTabGateMessage: () => void;
};

const AppTabContext = createContext<AppTabContextValue | null>(null);

function readTabFromWindow(): AppTab {
  const params = new URLSearchParams(window.location.search);
  return parseAppTab(window.location.pathname, params.get("tab"));
}

function resolveTab(urlTab: AppTab, gatedTabsAllowed: boolean): AppTab {
  if (!gatedTabsAllowed && !PUBLIC_APP_TABS.includes(urlTab)) return "home";
  return urlTab;
}

function AppTabProviderInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = parseAppTab(pathname, searchParams.get("tab"));
  const { status: walletStatus } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const gatedTabsAllowed = canAccessGatedTabs(walletStatus, demoActive);

  const resolvedTab = resolveTab(urlTab, gatedTabsAllowed);
  const [tabOverride, setTabOverride] = useState<AppTab | null>(null);
  const tab = tabOverride ?? resolvedTab;
  const [tabGateMessage, setTabGateMessage] = useState<string | null>(null);
  const [questNavFocus, setQuestNavFocus] = useState<QuestNavFocus>(() =>
    urlTab === "quests" ? readQuestNavFocusFromWindow() : "path",
  );

  useEffect(() => {
    if (urlTab === "quests") {
      setQuestNavFocus(readQuestNavFocusFromWindow());
    }
  }, [urlTab, searchParams]);

  useEffect(() => {
    if (!gatedTabsAllowed && !PUBLIC_APP_TABS.includes(urlTab)) {
      window.history.replaceState(window.history.state, "", appTabHref("home"));
    }
  }, [gatedTabsAllowed, urlTab]);

  useEffect(() => {
    const onPopState = () => {
      const next = readTabFromWindow();
      const allowed = resolveTab(next, gatedTabsAllowed);
      if (!gatedTabsAllowed && !PUBLIC_APP_TABS.includes(next)) {
        setTabGateMessage(CONNECT_TO_CONTINUE_MESSAGE);
        window.history.replaceState(window.history.state, "", appTabHref("home"));
      }
      setTabOverride(allowed);
      if (allowed === "quests") {
        setQuestNavFocus(readQuestNavFocusFromWindow());
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [gatedTabsAllowed]);

  const clearTabGateMessage = useCallback(() => setTabGateMessage(null), []);

  const setTab = useCallback(
    (next: AppTab, options?: SetTabOptions) => {
      if (!PUBLIC_APP_TABS.includes(next) && !gatedTabsAllowed) {
        setTabGateMessage(CONNECT_TO_CONTINUE_MESSAGE);
        return;
      }
      setTabGateMessage(null);
      const href = appTabHref(next, options?.hash);
      const sameTab = tab === next;
      window.history.replaceState(window.history.state, "", href);
      setTabOverride(next);
      if (next === "quests") {
        setQuestNavFocus(options?.hash === "claim" ? "claim" : "path");
      }
      if (options?.hash) {
        const raw = options.hash.replace(/^#/, "");
        const id = raw.startsWith("quest-") ? raw : `quest-${raw}`;
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } else if (!sameTab) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [gatedTabsAllowed, tab],
  );

  const value = useMemo(
    () => ({
      tab,
      questNavFocus,
      setTab,
      canAccessGatedTabs: gatedTabsAllowed,
      tabGateMessage,
      clearTabGateMessage,
    }),
    [tab, questNavFocus, setTab, gatedTabsAllowed, tabGateMessage, clearTabGateMessage],
  );

  return <AppTabContext.Provider value={value}>{children}</AppTabContext.Provider>;
}

export function AppTabProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppTabProviderInner>{children}</AppTabProviderInner>
    </Suspense>
  );
}

export function useAppTab(): AppTabContextValue {
  const ctx = useContext(AppTabContext);
  if (!ctx) {
    throw new Error("useAppTab must be used within AppTabProvider");
  }
  return ctx;
}

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
import { type AppTab, appTabHref, parseAppTab } from "@/lib/app-tab";
import {
  canAccessGatedTabs,
  CONNECT_TO_CONTINUE_MESSAGE,
} from "@/lib/wallet-access";

type AppTabContextValue = {
  tab: AppTab;
  setTab: (next: AppTab) => void;
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
  if (!gatedTabsAllowed && urlTab !== "home") return "home";
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
  const [tab, setTabState] = useState<AppTab>(resolvedTab);
  const [tabGateMessage, setTabGateMessage] = useState<string | null>(null);

  useEffect(() => {
    setTabState(resolvedTab);
  }, [resolvedTab]);

  useEffect(() => {
    if (!gatedTabsAllowed && urlTab !== "home") {
      window.history.replaceState(window.history.state, "", appTabHref("home"));
    }
  }, [gatedTabsAllowed, urlTab]);

  useEffect(() => {
    const onPopState = () => {
      const next = readTabFromWindow();
      const allowed = resolveTab(next, gatedTabsAllowed);
      if (!gatedTabsAllowed && next !== "home") {
        setTabGateMessage(CONNECT_TO_CONTINUE_MESSAGE);
        window.history.replaceState(window.history.state, "", appTabHref("home"));
      }
      setTabState(allowed);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [gatedTabsAllowed]);

  const clearTabGateMessage = useCallback(() => setTabGateMessage(null), []);

  const setTab = useCallback(
    (next: AppTab) => {
      if (next !== "home" && !gatedTabsAllowed) {
        setTabGateMessage(CONNECT_TO_CONTINUE_MESSAGE);
        return;
      }
      setTabGateMessage(null);
      setTabState((current) => {
        if (current === next) return current;
        window.history.replaceState(window.history.state, "", appTabHref(next));
        return next;
      });
    },
    [gatedTabsAllowed],
  );

  const value = useMemo(
    () => ({
      tab,
      setTab,
      canAccessGatedTabs: gatedTabsAllowed,
      tabGateMessage,
      clearTabGateMessage,
    }),
    [tab, setTab, gatedTabsAllowed, tabGateMessage, clearTabGateMessage],
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

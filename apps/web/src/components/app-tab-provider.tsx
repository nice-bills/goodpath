"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { type AppTab, appTabHref, parseAppTab } from "@/lib/app-tab";

type AppTabContextValue = {
  tab: AppTab;
  setTab: (next: AppTab) => void;
};

const AppTabContext = createContext<AppTabContextValue | null>(null);

function readTabFromWindow(): AppTab {
  const params = new URLSearchParams(window.location.search);
  return parseAppTab(window.location.pathname, params.get("tab"));
}

export function AppTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = parseAppTab(pathname, searchParams.get("tab"));

  const [tab, setTabState] = useState<AppTab>(urlTab);

  useEffect(() => {
    setTabState(urlTab);
  }, [urlTab]);

  useEffect(() => {
    const onPopState = () => setTabState(readTabFromWindow());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setTab = useCallback((next: AppTab) => {
    setTabState((current) => {
      if (current === next) return current;
      window.history.replaceState(window.history.state, "", appTabHref(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ tab, setTab }), [tab, setTab]);

  return <AppTabContext.Provider value={value}>{children}</AppTabContext.Provider>;
}

export function useAppTab(): AppTabContextValue {
  const ctx = useContext(AppTabContext);
  if (!ctx) {
    throw new Error("useAppTab must be used within AppTabProvider");
  }
  return ctx;
}

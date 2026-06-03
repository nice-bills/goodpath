"use client";

import { useEffect, useState } from "react";
import { BottomNav, DesktopNav } from "@/components/main-nav";
import { PlatformGuide } from "@/components/platform-guide";
import { WalletGateToast } from "@/components/wallet-gate-toast";
import { isMobileBrowser } from "@/lib/mobile-wallet";
import { HomeTab } from "@/components/tabs/home-tab";
import { QuestsTab } from "@/components/tabs/quests-tab";
import { CelebrateTab } from "@/components/tabs/celebrate-tab";
import { AppTabProvider, useAppTab } from "@/components/app-tab-provider";
import type { AppTab } from "@/lib/app-tab";

function TabPanel({
  name,
  active,
  visited,
  children,
}: {
  name: AppTab;
  active: boolean;
  visited: boolean;
  children: React.ReactNode;
}) {
  if (!visited) return null;
  return (
    <div
      id={`tab-panel-${name}`}
      role="tabpanel"
      aria-labelledby={`tab-${name}`}
      hidden={!active}
      className={active ? "flex min-h-0 flex-1 flex-col" : undefined}
    >
      {children}
    </div>
  );
}

function AppTabShellInner() {
  const { tab, tabGateMessage, clearTabGateMessage, canAccessGatedTabs } = useAppTab();
  const showPlatformGuide = isMobileBrowser() && tab !== "celebrate";
  const [visited, setVisited] = useState<Set<AppTab>>(() => new Set(["home"]));

  useEffect(() => {
    if (tab !== "home" && !canAccessGatedTabs) return;
    setVisited((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, [tab, canAccessGatedTabs]);

  return (
    <div className="app-layout">
      <DesktopNav />
      <div className="app-layout-main">
        {showPlatformGuide ? <PlatformGuide /> : null}
        {tabGateMessage ? (
          <WalletGateToast message={tabGateMessage} onDismiss={clearTabGateMessage} />
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col">
          <TabPanel name="home" active={tab === "home"} visited={visited.has("home")}>
            <HomeTab />
          </TabPanel>
        <TabPanel name="quests" active={tab === "quests"} visited={visited.has("quests")}>
          <QuestsTab />
        </TabPanel>
        <TabPanel name="celebrate" active={tab === "celebrate"} visited={visited.has("celebrate")}>
          <CelebrateTab />
        </TabPanel>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export function AppTabShell() {
  return (
    <AppTabProvider>
      <AppTabShellInner />
    </AppTabProvider>
  );
}

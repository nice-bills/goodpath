"use client";

import { useMemo } from "react";
import { BottomNav, DesktopNav } from "@/components/main-nav";
import { PlatformGuide } from "@/components/platform-guide";
import { WalletGateToast } from "@/components/wallet-gate-toast";
import { isMobileBrowser } from "@/lib/mobile-wallet";
import { HomeTab } from "@/components/tabs/home-tab";
import { QuestsTab } from "@/components/tabs/quests-tab";
import { CelebrateTab } from "@/components/tabs/celebrate-tab";
import { ExploreTab } from "@/components/tabs/explore-tab";
import { AppTabProvider, useAppTab } from "@/components/app-tab-provider";
import { useReferralCapture } from "@/hooks/use-referral-capture";
import { useWalletSession } from "@/hooks/use-wallet-session";
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
  const { address } = useWalletSession();
  useReferralCapture(address);
  const showPlatformGuide = isMobileBrowser() && tab !== "celebrate";
  const visited = useMemo(() => {
    const next = new Set<AppTab>(["home", "explore"]);
    if (canAccessGatedTabs) {
      next.add("quests");
      next.add("celebrate");
    } else if (tab !== "home") {
      next.add(tab);
    }
    return next;
  }, [canAccessGatedTabs, tab]);

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
          <TabPanel name="explore" active={tab === "explore"} visited={visited.has("explore")}>
            <ExploreTab />
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

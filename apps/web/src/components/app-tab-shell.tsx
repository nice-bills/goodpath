"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
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
  const { tab } = useAppTab();
  const [visited, setVisited] = useState<Set<AppTab>>(() => new Set(["home"]));

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, [tab]);

  return (
    <>
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
      <BottomNav />
    </>
  );
}

export function AppTabShell() {
  return (
    <AppTabProvider>
      <AppTabShellInner />
    </AppTabProvider>
  );
}

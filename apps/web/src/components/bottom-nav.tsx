"use client";

import { House, Signpost, Trophy } from "@phosphor-icons/react";
import { useAppTab } from "@/hooks/use-app-tab";
import type { AppTab } from "@/lib/app-tab";

const links: { tab: AppTab; label: string; icon: typeof House }[] = [
  { tab: "home", label: "Home", icon: House },
  { tab: "quests", label: "Quests", icon: Signpost },
  { tab: "celebrate", label: "Done", icon: Trophy },
];

export function BottomNav() {
  const { tab, setTab } = useAppTab();

  return (
    <nav className="bottom-nav" aria-label="Main">
      {links.map(({ tab: id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            id={`tab-${id}`}
            role="tab"
            aria-selected={active}
            aria-controls={`tab-panel-${id}`}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon className="h-[18px] w-[18px]" weight={active ? "fill" : "regular"} aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

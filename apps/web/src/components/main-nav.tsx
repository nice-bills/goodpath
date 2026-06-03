"use client";

import { House, Signpost, Trophy } from "@phosphor-icons/react";
import { useAppTab } from "@/hooks/use-app-tab";
import type { AppTab } from "@/lib/app-tab";

const links: { tab: AppTab; label: string; icon: typeof House }[] = [
  { tab: "home", label: "Home", icon: House },
  { tab: "quests", label: "Quests", icon: Signpost },
  { tab: "celebrate", label: "Done", icon: Trophy },
];

function NavButton({
  id,
  label,
  icon: Icon,
  active,
  onSelect,
  layout,
  locked = false,
}: {
  id: AppTab;
  label: string;
  icon: typeof House;
  active: boolean;
  onSelect: (tab: AppTab) => void;
  layout: "bottom" | "side";
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      id={`tab-${id}`}
      role="tab"
      aria-selected={active}
      aria-disabled={locked}
      aria-controls={`tab-panel-${id}`}
      title={locked ? "Connect your wallet on Home first" : undefined}
      className={
        layout === "bottom"
          ? `nav-link ${active ? "nav-link-active" : ""} ${locked ? "nav-link-locked" : ""}`
          : `desktop-nav-link ${active ? "desktop-nav-link-active" : ""} ${locked ? "desktop-nav-link-locked" : ""}`
      }
      onClick={() => onSelect(id)}
    >
      <Icon className="h-[18px] w-[18px]" weight={active ? "fill" : "regular"} aria-hidden />
      {label}
    </button>
  );
}

function NavLinks({ layout }: { layout: "bottom" | "side" }) {
  const { tab, setTab, canAccessGatedTabs: tabsUnlocked } = useAppTab();

  return (
    <>
      {links.map((link) => {
        const locked = link.tab !== "home" && !tabsUnlocked;
        return (
          <NavButton
            key={link.tab}
            id={link.tab}
            label={link.label}
            icon={link.icon}
            active={tab === link.tab}
            onSelect={setTab}
            layout={layout}
            locked={locked}
          />
        );
      })}
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav mobile-nav" aria-label="Main">
      <NavLinks layout="bottom" />
    </nav>
  );
}

export function DesktopNav() {
  return (
    <nav className="desktop-nav" aria-label="Main">
      <p className="desktop-nav-brand">G$ Path</p>
      <div className="desktop-nav-links">
        <NavLinks layout="side" />
      </div>
    </nav>
  );
}

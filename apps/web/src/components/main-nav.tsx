"use client";

import { Compass, Gift, House, Signpost, Trophy } from "@phosphor-icons/react";
import { useAppTab } from "@/hooks/use-app-tab";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useClaimCountdown } from "@/hooks/use-claim-countdown";
import { LogoLockup } from "@/components/brand/logo-mark";
import type { NavItem } from "@/lib/app-tab";

const navItems: (NavItem & { icon: typeof House })[] = [
  { id: "run", tab: "home", label: "Run", icon: House },
  { id: "explore", tab: "explore", label: "Explore", icon: Compass },
  { id: "claim", tab: "quests", label: "Claim", hash: "claim", icon: Gift },
  { id: "path", tab: "quests", label: "Path", icon: Signpost },
  { id: "flex", tab: "celebrate", label: "Flex", icon: Trophy },
];

function NavButton({
  item,
  active,
  onSelect,
  layout,
  locked = false,
  hot = false,
  countdownShort,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onSelect: (item: (typeof navItems)[number]) => void;
  layout: "bottom" | "side";
  locked?: boolean;
  hot?: boolean;
  countdownShort?: string;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      id={`tab-${item.id}`}
      role="tab"
      aria-selected={active}
      aria-disabled={locked}
      aria-controls={`tab-panel-${item.tab}`}
      title={locked ? "Connect your wallet on Run first" : undefined}
      className={
        layout === "bottom"
          ? `nav-link ${active ? "nav-link-active" : ""} ${locked ? "nav-link-locked" : ""} ${item.id === "claim" ? "nav-link-claim" : ""} ${hot ? "nav-link-hot" : ""}`
          : `desktop-nav-link ${active ? "desktop-nav-link-active" : ""} ${locked ? "desktop-nav-link-locked" : ""} ${hot ? "desktop-nav-link-hot" : ""}`
      }
      onClick={() => onSelect(item)}
    >
      <Icon className="h-[18px] w-[18px]" weight={active ? "fill" : "regular"} aria-hidden />
      <span className="nav-link-label">{item.label}</span>
      {hot && item.id === "claim" ? (
        <span className="nav-link-countdown font-mono">{countdownShort}</span>
      ) : null}
    </button>
  );
}

function NavLinks({ layout }: { layout: "bottom" | "side" }) {
  const { tab, questNavFocus, setTab, canAccessGatedTabs: tabsUnlocked } = useAppTab();
  const { address } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile } = useProfile(address);
  const claimQuest = profile?.quests.find((q) => q.id === "claim");
  const claimHot =
    Boolean(claimQuest?.unlocked && !claimQuest.completed) && !demoActive;
  const countdown = useClaimCountdown();

  const activeNavId =
    tab === "home"
      ? "run"
      : tab === "explore"
        ? "explore"
        : tab === "celebrate"
          ? "flex"
          : tab === "quests"
            ? questNavFocus
            : "run";

  return (
    <>
      {navItems.map((item) => {
        const locked =
          item.tab !== "home" && item.tab !== "explore" && !tabsUnlocked;
        const active = item.id === activeNavId;
        return (
          <NavButton
            key={item.id}
            item={item}
            active={active}
            onSelect={(selected) => {
              setTab(selected.tab, selected.hash ? { hash: selected.hash } : undefined);
            }}
            layout={layout}
            locked={locked}
            hot={item.id === "claim" && claimHot && !active}
            countdownShort={countdown.shortLabel}
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
      <div className="desktop-nav-brand-row">
        <LogoLockup size="nav" />
      </div>
      <div className="desktop-nav-links">
        <NavLinks layout="side" />
      </div>
    </nav>
  );
}

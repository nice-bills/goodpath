"use client";

import { LogoLockup } from "@/components/brand/logo-mark";
import { TabLink } from "@/components/tab-link";
import { ConnectButton } from "@/components/connect-button";
import { QuestCard } from "@/components/quest-card";
import { StartRunBoard } from "@/components/start-run-board";
import { HomeSkeleton } from "@/components/ui/skeleton";
import { HomeRunVibe } from "@/components/vibe/home-run-vibe";
import { useClaimTabHint } from "@/hooks/use-claim-tab-hint";
import { useAppTab } from "@/hooks/use-app-tab";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { QuestStatus } from "@/lib/api";

export function HomeTab() {
  const { tab, setTab } = useAppTab();
  const { status: walletStatus, address: walletAddress } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile, isLoading, isError, error: profileError } = useProfile(walletAddress);
  const { show: showClaimHint, dismiss: dismissClaimHint } = useClaimTabHint(profile, tab);
  const profileErrorMessage =
    profileError instanceof Error ? profileError.message : null;

  const nextQuest = profile?.quests.find((q) => !q.completed && q.unlocked);
  const pathDone = Boolean(profile?.pathCompletedAt);
  const hasWallet = walletStatus === "ready" && Boolean(walletAddress);
  const showPath = demoActive || (hasWallet && !isError);

  return (
    <main className={showPath ? "flex flex-1 flex-col" : "main-start flex flex-1 flex-col"}>
      {hasWallet && isError && !demoActive && (
        <div className="card mb-6 border-loss/30 bg-loss-soft p-4 text-sm text-loss">
          Could not load your path. Set{" "}
          <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_CONVEX_URL</code> (run{" "}
          <code className="rounded bg-surface-muted px-1">npx convex dev</code> locally,{" "}
          <code className="rounded bg-surface-muted px-1">npx convex deploy</code> for production).
          {profileErrorMessage ? ` (${profileErrorMessage})` : null}
        </div>
      )}

      {showPath && isLoading ? (
        <HomeSkeleton />
      ) : showPath && profile ? (
        <div className="vibe-home-page">
          <header className="vibe-top-bar vibe-top-bar-connected">
            <LogoLockup size="nav" className="vibe-top-bar-brand" />
            <span className="flex-1" aria-hidden />
            {hasWallet ? <ConnectButton variant="pill" /> : null}
          </header>
          {showClaimHint ? (
            <div className="vibe-claim-hint" role="status">
              <p className="vibe-claim-hint-text">
                Daily claim is live. Tap <strong>Claim</strong> in the nav when you&apos;re ready.
              </p>
              <button
                type="button"
                className="vibe-claim-hint-go"
                onClick={() => {
                  dismissClaimHint();
                  setTab("quests", { hash: "claim" });
                }}
              >
                Go to claim
              </button>
              <button
                type="button"
                className="vibe-claim-hint-dismiss"
                onClick={dismissClaimHint}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ) : null}
          <HomeRunVibe profile={profile} />
          {!pathDone && (
            <section className="vibe-up-next" aria-label="Up next on your path">
              <div className="vibe-up-next-head">
                <h3 className="vibe-feed-title">
                  Up next <span aria-hidden>⚡</span>
                </h3>
                <TabLink tab="quests" className="vibe-link-all">
                  Full path
                </TabLink>
              </div>
              <div className="vibe-up-next-grid">
                {(profile.quests ?? []).slice(0, 3).map((q: QuestStatus, i: number) => (
                  <QuestCard
                    key={q.id}
                    quest={q}
                    index={i}
                    active={q.id === nextQuest?.id}
                    compact
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="start-landing">
          <header className="start-landing-intro">
            <div className="vibe-top-bar vibe-top-bar-landing">
              <LogoLockup size="nav" />
            </div>
            <div className="start-landing-meta">
              <span className="start-landing-live">
                <span className="start-live-dot" aria-hidden />
                Live on Celo
              </span>
              <span className="start-landing-stamp">Week 1</span>
            </div>
            <h1 className="font-display start-landing-title">
              The run is{" "}
              <span className="start-landing-accent">heating up</span>
              <span className="start-landing-emoji" aria-hidden>
                🔥
              </span>
            </h1>
            <p className="start-landing-lead">
              Claim, flex your rank, stream G$. Miss a day and someone else eats your
              spot.
            </p>
            <ul className="start-landing-chips" aria-label="What you unlock">
              <li>Claim daily G$</li>
              <li>Beat the board</li>
              <li>Flex your rank</li>
            </ul>
          </header>
          <StartRunBoard />
        </div>
      )}
    </main>
  );
}

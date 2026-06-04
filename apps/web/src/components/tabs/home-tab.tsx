"use client";

import { TabLink } from "@/components/tab-link";
import {
  ArrowRight,
  Coins,
  Fingerprint,
  Gift,
  HandHeart,
  Wallet,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/page-header";
import { HeroPath } from "@/components/hero-path";
import { QuestCard } from "@/components/quest-card";
import { ConnectButton } from "@/components/connect-button";
import { HomeSkeleton } from "@/components/ui/skeleton";
import { ImpactStrip } from "@/components/impact-strip";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { TodaysHabit } from "@/components/todays-habit";
import { RunHeroCard } from "@/components/run-hero-card";
import { RunChallengeCard } from "@/components/run-challenge-card";
import { PersonalBestsCard } from "@/components/personal-bests-card";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";

const pathPreviewSteps = [
  {
    step: 1,
    title: "Your wallet",
    hint: "Connect on Celo to unlock the path",
    icon: Wallet,
  },
  { step: 2, title: "Verify identity", hint: "Face verification", icon: Fingerprint },
  { step: 3, title: "Claim daily G$", hint: "Gas-sponsored UBI", icon: Gift },
  { step: 4, title: "Send a G$ tip", hint: "Move G$ on-chain", icon: Coins },
  { step: 5, title: "Support community", hint: "GoodCollective", icon: HandHeart },
] as const;

function StickerStartPreview() {
  return (
    <section
      className="passport-hero start-passport animate-fade-in"
      aria-labelledby="start-passport-title"
    >
      <div className="passport-paper">
        <div className="passport-head">
          <div>
            <span>Week 1</span>
            <strong id="start-passport-title">My G$ passport</strong>
            <p className="mt-1 text-sm text-muted">5 stickers · one receipt · ~5 minutes</p>
          </div>
        </div>

        <div className="passport-grid mt-4" aria-label="5 path stickers, all locked">
          {pathPreviewSteps.map(({ step, title }, index) => (
            <div
              key={step}
              className={`passport-stamp passport-stamp-${index + 1} is-empty`}
              title={title}
            >
              <span>Locked</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>

        <div className="start-receipt-stub">
          <div>
            <span className="start-receipt-label">Receipt locked</span>
            <strong className="start-receipt-count">0 / 5</strong>
          </div>
          <ConnectButton variant="pill" />
        </div>
      </div>
    </section>
  );
}

export function HomeTab() {
  const { status: walletStatus, address: walletAddress } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile, isLoading, isError, error } = useProfile(walletAddress);

  const progress = profile?.progress ?? 0;
  const streak = profile?.streak ?? 0;
  const nextQuest = profile?.quests.find((q) => !q.completed && q.unlocked);
  const pathDone = Boolean(profile?.pathCompletedAt);
  const hasWallet = walletStatus === "ready" && Boolean(walletAddress);
  const showPath = demoActive || (hasWallet && !isError);

  return (
    <main className={showPath ? "flex flex-1 flex-col" : "main-start flex flex-1 flex-col"}>
      {showPath ? (
        <PageHeader
          className="home-page-header"
          title="G$ Path"
          subtitle="Your weekly run on Celo — move G$, earn proofs, climb the league."
          showConnect={hasWallet}
        />
      ) : null}

      <DemoModeBanner />

      {hasWallet && isError && !demoActive && (
        <div className="card mb-6 border-loss/30 bg-loss-soft p-4 text-sm text-loss">
          Could not load your path. From the project root run{" "}
          <code className="rounded bg-surface-muted px-1">pnpm dev</code> (starts web +
          API on port 3001).
          {error instanceof Error ? ` (${error.message})` : null}
        </div>
      )}

      {showPath && isLoading ? (
        <HomeSkeleton />
      ) : showPath && profile ? (
        <div className="home-dashboard">
          <ImpactStrip className="home-impact-strip" />
          <aside className="home-dashboard-aside">
            <RunHeroCard profile={profile} />
            <RunChallengeCard profile={profile} />
            {(pathDone || progress > 0) && <PersonalBestsCard profile={profile} />}
            {pathDone && <TodaysHabit streak={streak} />}
          </aside>

          <div className="home-dashboard-main">
            <HeroPath
              progress={progress}
              streak={streak}
              quests={profile.quests}
              headline={pathDone ? "Path complete" : nextQuest ? "Next quest" : "Continue"}
              subline={
                pathDone
                  ? "Receipt ready on Celebrate — claim again tomorrow."
                  : nextQuest
                    ? nextQuest.title
                    : "Open quests to pick up where you left off."
              }
            />

            <TabLink
              tab={pathDone ? "celebrate" : "quests"}
              className="btn-primary group home-dashboard-cta"
            >
              {pathDone ? "View receipt" : "Continue quests"}
              <span className="btn-icon-wrap">
                <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
              </span>
            </TabLink>
          </div>

          {!pathDone && (
            <section className="home-dashboard-upcoming" aria-label="Upcoming quests">
              <div className="home-upcoming-head">
                <span className="section-label">Upcoming</span>
                <TabLink
                  tab="quests"
                  className="text-xs font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  All
                </TabLink>
              </div>

              <div className="home-upcoming-grid">
                {(profile.quests ?? []).slice(0, 3).map((q, i) => (
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
            <span className="eyebrow">GoodDollar</span>
            <h1 className="font-display start-landing-title">Start your G$ run</h1>
            <p className="start-landing-lead">
              Solo-first league on Celo mainnet — verify, claim, tip, support a pool, then
              save or stream G$. Every score is a real on-chain proof.
            </p>
          </header>
          <StickerStartPreview />
        </div>
      )}
    </main>
  );
}

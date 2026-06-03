"use client";

import type { CSSProperties } from "react";
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
import { LeagueCard } from "@/components/league-card";
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
  const [hero, ...upcoming] = pathPreviewSteps;
  const HeroIcon = hero.icon;

  return (
    <section className="start-passport animate-fade-in" aria-labelledby="start-passport-title">
      <div className="passport-paper start-passport-paper">
        <header className="start-passport-head">
          <p className="section-label">Week 1</p>
          <h2 id="start-passport-title" className="start-passport-title">
            My G$ passport
          </h2>
          <p className="start-passport-meta">5 stickers · one receipt · ~5 minutes</p>
        </header>

        <div className="start-path-board" aria-label="Path preview">
          <article className="start-path-step start-path-step-hero">
            <div className="start-path-step-icon" aria-hidden>
              <HeroIcon className="h-5 w-5" weight="bold" />
            </div>
            <div className="start-path-step-copy">
              <span className="start-path-step-num">Step {hero.step}</span>
              <strong>{hero.title}</strong>
              <p>{hero.hint}</p>
            </div>
          </article>

          <ol className="start-path-upcoming">
            {upcoming.map(({ step, title, hint, icon: Icon }, index) => (
              <li
                key={step}
                className="start-path-step start-path-step-locked"
                style={
                  {
                    "--stamp-rotate": `${(index % 2 === 0 ? -1 : 1) * 1.25}deg`,
                  } as CSSProperties
                }
              >
                <div
                  className="start-path-step-icon start-path-step-icon--muted"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" weight="bold" />
                </div>
                <div className="start-path-step-copy">
                  <span className="start-path-step-num">Step {step}</span>
                  <strong>{title}</strong>
                  <p>{hint}</p>
                </div>
              </li>
            ))}
          </ol>
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
          title="G$ Path"
          subtitle="Five steps. Five minutes. Real GoodDollar onboarding."
          showConnect={hasWallet}
        />
      ) : null}

      {hasWallet ? <ImpactStrip /> : null}
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
        <>
          <div className="home-dashboard-grid">
            <LeagueCard profile={profile} />
            {(pathDone || progress > 0) && <PersonalBestsCard profile={profile} />}
            {pathDone && <TodaysHabit streak={streak} />}
          </div>

          <div className="home-dashboard-span">
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
          </div>

          <TabLink
            tab={pathDone ? "celebrate" : "quests"}
            className="btn-primary group mb-8"
          >
            {pathDone ? "View receipt" : "Continue quests"}
            <span className="btn-icon-wrap">
              <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
            </span>
          </TabLink>

          {!pathDone && (
            <>
              <div className="mb-3 flex items-end justify-between">
                <span className="section-label">Upcoming</span>
                <TabLink
                  tab="quests"
                  className="text-xs font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  All
                </TabLink>
              </div>

              <div className="flex flex-col gap-2">
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
            </>
          )}
        </>
      ) : (
        <div className="start-landing">
          <header className="start-landing-intro">
            <span className="eyebrow">GoodDollar</span>
            <h1 className="font-display start-landing-title">G$ Path</h1>
            <p className="start-landing-lead">
              Five steps. Five minutes. Real onboarding on Celo — verify, claim, move G$,
              earn your receipt.
            </p>
          </header>
          <StickerStartPreview />
        </div>
      )}
    </main>
  );
}

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
import { LeagueCard } from "@/components/league-card";
import { PersonalBestsCard } from "@/components/personal-bests-card";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";

const previewStickers = [
  { title: "Connect wallet", label: "Step 1", icon: Wallet },
  { title: "Verify identity", label: "+1 step", icon: Fingerprint },
  { title: "Claim daily G$", label: "Daily UBI", icon: Gift },
  { title: "Send a G$ tip", label: "Utility unlocked", icon: Coins },
  { title: "Support the community", label: "Community badge", icon: HandHeart },
] as const;

function StickerStartPreview() {
  return (
    <section className="start-passport animate-fade-in">
      <div className="passport-paper">
        <div className="passport-head">
          <div>
            <span>Week 1</span>
            <strong>My G$ passport</strong>
          </div>
        </div>

        <div className="start-sticker-stack" aria-label="G$ Path preview stickers">
          {previewStickers.map(({ title, label, icon: Icon }, index) => (
            <div key={title} className={`start-sticker start-sticker-${index + 1}`}>
              <span className="sticker-tape" aria-hidden />
              <Icon className="h-4 w-4" weight="duotone" aria-hidden />
              <strong>{title}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="start-receipt-stub">
          <div>
            <span>Receipt locked</span>
            <strong>0 / 5 stickers</strong>
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
    <main className="flex flex-1 flex-col">
      <PageHeader
        title="G$ Path"
        subtitle="Five steps. Five minutes. Real GoodDollar onboarding."
      />

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
          <LeagueCard profile={profile} />
          {(pathDone || progress > 0) && <PersonalBestsCard profile={profile} />}
          {pathDone && <TodaysHabit streak={streak} />}

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
          <StickerStartPreview />
        </div>
      )}
    </main>
  );
}

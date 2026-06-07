"use client";

import {
  CheckCircle,
  Fire,
  Gift,
  Lock,
  Target,
  TrendUp,
} from "@phosphor-icons/react";
import { deriveDailyRun } from "@goodpath/shared";
import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved } from "@/lib/format";
import { TabLink } from "@/components/tab-link";
import { GDollarChooser } from "@/components/g-dollar-chooser";
import { DailyCommitLock } from "@/components/daily-commit-lock";
import { DailyCommitLocked } from "@/components/daily-commit-locked";
import {
  useClaimAvailability,
  type ClaimAvailability,
} from "@/hooks/use-claim-availability";

function ClaimStatus({
  daily,
  claim,
}: {
  daily: ReturnType<typeof deriveDailyRun>;
  claim: ClaimAvailability;
}) {
  return (
    <div className="todays-run-stat">
      <span className="todays-run-stat-label">Claim</span>
      <span
        className={`todays-run-stat-value${daily.claimedToday ? " is-done" : " is-due"}`}
      >
        {daily.claimedToday ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" weight="fill" aria-hidden />
            Claimed today
          </>
        ) : claim.checking ? (
          <>
            <Gift className="h-3.5 w-3.5" weight="bold" aria-hidden />
            Checking…
          </>
        ) : claim.claimBlocked ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" weight="fill" aria-hidden />
            On-chain done
          </>
        ) : (
          <>
            <Gift className="h-3.5 w-3.5" weight="bold" aria-hidden />
            Not yet
          </>
        )}
      </span>
    </div>
  );
}

function BetStatus({ daily }: { daily: ReturnType<typeof deriveDailyRun> }) {
  return (
    <div className="todays-run-stat">
      <span className="todays-run-stat-label">Bet</span>
      <span
        className={`todays-run-stat-value${
          daily.commitmentFulfilled
            ? " is-done"
            : daily.commitDue
              ? " is-due"
              : daily.commitment
                ? " is-warm"
                : ""
        }`}
      >
        {daily.commitmentFulfilled ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" weight="fill" aria-hidden />
            Delivered
          </>
        ) : daily.commitDue ? (
          <>
            <Target className="h-3.5 w-3.5" weight="bold" aria-hidden />
            Open
          </>
        ) : daily.commitment ? (
          <>
            <Lock className="h-3.5 w-3.5" weight="bold" aria-hidden />
            Locked
          </>
        ) : (
          <>
            <Target className="h-3.5 w-3.5" weight="bold" aria-hidden />
            —
          </>
        )}
      </span>
    </div>
  );
}

function FuelStatus({ daily }: { daily: ReturnType<typeof deriveDailyRun> }) {
  const fuelLabel = daily.fuelWei ? formatGsMoved(daily.fuelWei) : null;
  return (
    <div className="todays-run-stat">
      <span className="todays-run-stat-label">Fuel</span>
      <span
        className={`todays-run-stat-value${daily.claimedToday ? " is-warm" : ""}`}
      >
        {daily.claimedToday
          ? fuelLabel
            ? `${fuelLabel} G$`
            : "In wallet"
          : "Claim first"}
      </span>
    </div>
  );
}

function StreakStatus({
  daily,
  streak,
}: {
  daily: ReturnType<typeof deriveDailyRun>;
  streak: number;
}) {
  return (
    <div className="todays-run-stat">
      <span className="todays-run-stat-label">Streak</span>
      <span
        className={`todays-run-stat-value${daily.streakAtRisk ? " is-risk" : streak > 0 ? " is-warm" : ""}`}
      >
        <Fire className="h-3.5 w-3.5" weight="fill" aria-hidden />
        {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "Start today"}
      </span>
    </div>
  );
}

function RivalStatus({ daily }: { daily: ReturnType<typeof deriveDailyRun> }) {
  const gap = daily.rivalGap;
  return (
    <div className="todays-run-stat">
      <span className="todays-run-stat-label">Rival gap</span>
      <span className="todays-run-stat-value">
        <TrendUp className="h-3.5 w-3.5" weight="bold" aria-hidden />
        {gap ? `${gap.gap} pt${gap.gap === 1 ? "" : "s"} vs ${gap.label}` : "Clear"}
      </span>
    </div>
  );
}

function BestNextMove({
  daily,
  verified,
  claim,
}: {
  daily: ReturnType<typeof deriveDailyRun>;
  verified: boolean;
  claim: ClaimAvailability;
}) {
  if (!verified) {
    return (
      <p className="todays-run-move">
        Verify on Celo to unlock today&apos;s G$ run.
      </p>
    );
  }

  if (!daily.claimedToday) {
    if (claim.checking) {
      return (
        <p className="todays-run-move">Checking today&apos;s G$ with GoodDollar…</p>
      );
    }
    if (claim.claimBlocked) {
      return (
        <p className="todays-run-move todays-run-move-done">
          Today&apos;s claim looks done on-chain. Lock your bet from Claim when Convex syncs, or
          refresh in a minute.
        </p>
      );
    }
    if (claim.canClaimNow) {
      return (
        <>
          <p className="todays-run-move">Claim today&apos;s G$ to start the run.</p>
          <TabLink tab="quests" hash="claim" className="vibe-cta-pill group">
            Claim G$ now
          </TabLink>
        </>
      );
    }
    return (
      <p className="todays-run-move">Today&apos;s claim window isn&apos;t open yet. Check back soon.</p>
    );
  }

  if (daily.commitDue) {
    return <DailyCommitLock />;
  }

  if (daily.commitment && !daily.commitmentFulfilled) {
    return <DailyCommitLocked commitment={daily.commitment} />;
  }

  if (daily.runCompleteToday) {
    return (
      <>
        <p className="todays-run-move todays-run-move-done">
          Today&apos;s run is locked in. Flex your receipt or come back tomorrow.
        </p>
        <GDollarChooser compact title="Flex or keep moving" />
      </>
    );
  }

  return (
    <>
      <p className="todays-run-move">
        {daily.bestNextUseLabel
          ? `Best next move: ${daily.bestNextUseLabel.toLowerCase()}.`
          : "Pick where today's G$ goes."}
      </p>
      <GDollarChooser compact />
    </>
  );
}

export function TodaysRunCard({ profile }: { profile: ProfileResponse }) {
  const claim = useClaimAvailability(profile);
  const daily =
    profile.dailyRun ??
    deriveDailyRun({
      lastActiveDate: profile.lastActiveDate,
      streak: profile.streak,
      quests: profile.quests,
      completions: profile.completions,
      league: profile.league,
    });

  const verified = Boolean(profile.completions.verify);
  const streak = profile.streak ?? 0;

  return (
    <section className="todays-run-card" aria-label="Today's run">
      <div className="todays-run-head">
        <span className="vibe-you-badge">Today&apos;s run</span>
        {daily.primaryIdentity ? (
          <span className="todays-run-identity">{daily.primaryIdentity}</span>
        ) : null}
      </div>

      <div className="todays-run-stats">
        <ClaimStatus daily={daily} claim={claim} />
        <BetStatus daily={daily} />
        <FuelStatus daily={daily} />
        <StreakStatus daily={daily} streak={streak} />
        <RivalStatus daily={daily} />
      </div>

      <BestNextMove daily={daily} verified={verified} claim={claim} />

      <p className="todays-run-tomorrow">{daily.tomorrowHook}</p>
    </section>
  );
}

"use client";

import { CheckCircle, Fire, Gift } from "@phosphor-icons/react";
import {
  deriveDailyRun,
  G_DOLLAR_USE_PATHS,
  type DailyRunState,
} from "@goodpath/shared";
import type { ProfileResponse } from "@/lib/api";
import { TabLink } from "@/components/tab-link";
import { GDollarChooser } from "@/components/g-dollar-chooser";

function ClaimStatus({ daily }: { daily: DailyRunState }) {
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

function StreakStatus({ daily, streak }: { daily: DailyRunState; streak: number }) {
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

function BestNextMove({
  daily,
  verified,
}: {
  daily: DailyRunState;
  verified: boolean;
}) {
  if (!verified) {
    return (
      <p className="todays-run-move">
        Verify on Celo to unlock today&apos;s G$ run.
      </p>
    );
  }

  if (!daily.claimedToday) {
    return (
      <>
        <p className="todays-run-move">Claim today&apos;s G$ to start the run.</p>
        <TabLink tab="quests" hash="claim" className="vibe-cta-pill group">
          Claim G$ now
        </TabLink>
      </>
    );
  }

  if (daily.runCompleteToday) {
    return (
      <p className="todays-run-move todays-run-move-done">
        Today&apos;s run is locked in. Flex your receipt or come back tomorrow.
      </p>
    );
  }

  const path = daily.bestNextUse
    ? G_DOLLAR_USE_PATHS.find((p) => p.id === daily.bestNextUse)
    : null;

  return (
    <>
      <p className="todays-run-move">
        {path
          ? `Best next move: ${path.label.toLowerCase()}.`
          : "Pick where today's G$ goes."}
      </p>
      <GDollarChooser compact />
    </>
  );
}

export function TodaysRunCard({ profile }: { profile: ProfileResponse }) {
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
        <ClaimStatus daily={daily} />
        <StreakStatus daily={daily} streak={streak} />
      </div>

      <BestNextMove daily={daily} verified={verified} />

      <p className="todays-run-tomorrow">{daily.tomorrowHook}</p>
    </section>
  );
}

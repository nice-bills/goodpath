"use client";

import { deriveDailyRun } from "@goodpath/shared";
import { Fire } from "@phosphor-icons/react";
import type { ProfileResponse } from "@/lib/api";
import { GDollarChooser } from "@/components/g-dollar-chooser";
import { TabLink } from "@/components/tab-link";

export function TodaysHabit({
  profile,
  streak,
}: {
  profile?: ProfileResponse;
  streak: number;
}) {
  const daily = profile
    ? (profile.dailyRun ??
      deriveDailyRun({
        lastActiveDate: profile.lastActiveDate,
        streak: profile.streak,
        quests: profile.quests,
        completions: profile.completions,
        league: profile.league,
      }))
    : null;

  return (
    <section className="habit-card mb-6">
      <div>
        <p className="section-label mb-1">Tomorrow hook</p>
        <h2>Keep the daily run alive</h2>
        <p>{daily?.tomorrowHook ?? "Come back tomorrow to claim again and move G$."}</p>
      </div>

      <div className="habit-streak">
        <Fire className="size-5" weight="fill" aria-hidden />
        <span>{streak} day streak</span>
        <small>{daily?.streakAtRisk ? "claim to save it" : "keep it warm"}</small>
      </div>

      {daily?.claimedToday && !daily.usedGToday ? (
        <div className="mt-4">
          <GDollarChooser title="Use today's G$ before tomorrow" compact />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          <TabLink
            tab="quests"
            hash="claim"
            className="btn-primary flex items-center justify-center gap-2 text-sm"
          >
            Claim tomorrow&apos;s G$
          </TabLink>
          <TabLink
            tab="celebrate"
            className="btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            Flex receipt
          </TabLink>
        </div>
      )}
    </section>
  );
}

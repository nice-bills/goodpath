"use client";

import type { ProfileResponse } from "@/lib/api";
import { beatMedianChallenge } from "@goodpath/shared";

export function RunChallengeCard({ profile }: { profile: ProfileResponse }) {
  const { league } = profile;
  if (!league?.division) return null;

  const { median, ahead, pointsToMedian } = beatMedianChallenge(
    league.points,
    league.division,
  );

  return (
    <section className="run-challenge-card" aria-label="Solo challenge">
      <p className="text-[10px] font-black uppercase tracking-wider text-muted">
        Solo challenge
      </p>
      <p className="mt-1 font-display text-xl leading-tight">
        {ahead ? "Above division median" : "Beat the median"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {ahead ? (
          <>
            Your <span className="font-mono font-semibold text-foreground">{league.points}</span>{" "}
            pts beat the seeded {league.divisionLabel} median ({median}).
          </>
        ) : (
          <>
            Need{" "}
            <span className="font-mono font-semibold text-foreground">{pointsToMedian}</span>{" "}
            more pts to pass the {league.divisionLabel} median ({median}) — tip, support, or
            deploy G$.
          </>
        )}
      </p>
      {(profile.referralsCompletedThisWeek ?? 0) > 0 ? (
        <p className="mt-2 text-[10px] text-muted">
          <span className="font-mono font-semibold text-foreground">
            {profile.referralsCompletedThisWeek}
          </span>{" "}
          friend{profile.referralsCompletedThisWeek === 1 ? "" : "s"} finished the path this week
          (+15 league pts each).
        </p>
      ) : null}
    </section>
  );
}

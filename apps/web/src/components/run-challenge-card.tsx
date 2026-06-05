"use client";

import type { ProfileResponse } from "@/lib/api";
import { beatMedianChallenge, type LeagueDivision } from "@goodpath/shared";
import { formatPoints } from "@/lib/format";

export function RunChallengeCard({ profile }: { profile: ProfileResponse }) {
  const { league } = profile;
  if (!league?.division) return null;

  const { median, ahead, pointsToMedian } = beatMedianChallenge(
    league.points,
    league.division as LeagueDivision,
  );

  const board = league.divisionLeaderboard?.slice(0, 4) ?? [];

  return (
    <section className="run-challenge-card" aria-label="Solo challenge">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
        Solo challenge
      </p>
      <p className="mt-1 font-display text-xl leading-tight">
        {ahead ? "Above division median" : "Beat the median"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {ahead ? (
          <>
            Your{" "}
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {formatPoints(league.points)}
            </span>{" "}
            pts beat the {league.divisionLabel} median ({median}). Benchmark rows are labeled.
          </>
        ) : (
          <>
            Need{" "}
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {pointsToMedian}
            </span>{" "}
            more pts to pass the {league.divisionLabel} median ({median}).
          </>
        )}
      </p>
      {board.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-xs" aria-label="Division snapshot">
          {board.map((row) => (
            <li
              key={`${row.label}-${row.points}`}
              className={
                row.isUser
                  ? "font-semibold text-foreground"
                  : "text-muted"
              }
            >
              <span className="font-mono tabular-nums">{formatPoints(row.points)}</span>
              <span className="text-muted-dim"> · </span>
              {row.label}
              {row.isSeeded ? " · benchmark" : row.isUser ? " · you" : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {(profile.referralsCompletedThisWeek ?? 0) > 0 ? (
        <p className="mt-3 text-[10px] text-muted">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {profile.referralsCompletedThisWeek}
          </span>{" "}
          friend{profile.referralsCompletedThisWeek === 1 ? "" : "s"} finished the path this week.
        </p>
      ) : null}
    </section>
  );
}

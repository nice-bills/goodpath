"use client";

import type { ProfileResponse } from "@/lib/api";

export function LeagueCard({ profile }: { profile: ProfileResponse }) {
  const { league } = profile;
  if (!league) return null;

  const rankLabel =
    league.rank != null
      ? `#${league.rank} of ${league.totalInLeague}`
      : "Join the board";

  return (
    <section className="league-card" aria-label="Weekly league">
      <div className="league-card-inner">
        <div>
          <span>This week · {league.periodId}</span>
          <strong>{rankLabel}</strong>
          <p className="mt-1 text-sm text-muted">
            {league.points} league pts
            {league.promoted ? " · Top 3, promoted next week" : ""}
          </p>
        </div>
        <div className="league-points-pill">
          <span>Points</span>
          <strong>{league.points}</strong>
        </div>
      </div>
      {league.streakShield && (
        <p className="league-shield-note">
          Streak shield earned. One missed claim forgiven this week.
        </p>
      )}
      {(profile.chainProofs?.length ?? 0) > 0 && (
        <p className="mt-2 text-[10px] text-muted">
          {profile.chainProofs!.length} on-chain proof
          {profile.chainProofs!.length === 1 ? "" : "s"} this path:{" "}
          <span className="font-semibold text-foreground">provable on Celoscan</span>
        </p>
      )}
    </section>
  );
}

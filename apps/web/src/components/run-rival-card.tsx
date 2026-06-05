"use client";

import type { ProfileResponse } from "@/lib/api";

/** Weekly rival — seeded benchmark or user-picked address. */
export function RunRivalCard({ profile }: { profile: ProfileResponse }) {
  const rival = profile.league?.rival;
  if (!rival) return null;

  return (
    <section className="run-rival-card card p-4" aria-label="Your rival">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
        Weekly rival
      </p>
      <p className="mt-1 font-display text-lg leading-tight">
        {rival.isSeeded ? "Pace to beat this week" : (rival.label ?? "Rival run")}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {rival.isSeeded
          ? "Practice target from league scoring, not a real person. Your job: beat the points with real G$ txs."
          : `Tracking ${rival.address.slice(0, 6)}…${rival.address.slice(-4)}`}
      </p>
      {profile.squads && profile.squads.length > 0 ? (
        <p className="mt-2 text-[10px] text-muted-dim">
          Squad preview: {profile.squads[0]!.squad_id}
        </p>
      ) : null}
    </section>
  );
}

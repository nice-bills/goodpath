"use client";

import type { ProfileResponse } from "@/lib/api";
import { formatPathDuration } from "@/lib/format";

export function PersonalBestsCard({ profile }: { profile: ProfileResponse }) {
  const { personalBests } = profile;
  if (!personalBests) return null;

  const items = [
    {
      label: "Fastest path",
      value: personalBests.fastestPathSeconds
        ? formatPathDuration(personalBests.fastestPathSeconds)
        : "—",
    },
    {
      label: "Longest streak",
      value: `${personalBests.longestStreak} day${personalBests.longestStreak === 1 ? "" : "s"}`,
    },
    {
      label: "Claims this week",
      value: String(personalBests.claimsThisWeek),
    },
  ];

  return (
    <section className="passport-hero records-passport" aria-label="Your records">
      <div className="passport-paper py-4 records-passport-paper">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted">
          Your records
        </span>
        <div className="records-grid mt-3">
          {items.map(({ label, value }) => (
            <div key={label} className="record-stamp">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

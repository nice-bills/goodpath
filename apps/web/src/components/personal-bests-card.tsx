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
    <section className="records-card" aria-label="Your records">
      <div className="records-card-inner">
        <span className="section-label">Your records</span>
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

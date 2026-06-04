"use client";

import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved, formatPathDuration } from "@/lib/format";

export function ReceiptScorecard({ profile }: { profile: ProfileResponse }) {
  const proofCount = profile.chainProofs?.length ?? 0;
  const gMoved = formatGsMoved(profile.league?.gMovedWei);

  return (
    <dl className="receipt-scorecard mt-4 grid grid-cols-2 gap-3">
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          G$ moved (week)
        </dt>
        <dd className="font-mono text-lg font-semibold">{gMoved}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          Division
        </dt>
        <dd className="font-mono text-lg font-semibold">
          {profile.league?.divisionLabel ?? "—"}
          {profile.league?.divisionRank != null
            ? ` · #${profile.league.divisionRank}`
            : ""}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          Celoscan proofs
        </dt>
        <dd className="font-mono text-lg font-semibold">{proofCount}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          Fastest path
        </dt>
        <dd className="font-mono text-lg font-semibold">
          {profile.personalBests?.fastestPathSeconds
            ? formatPathDuration(profile.personalBests.fastestPathSeconds)
            : "—"}
        </dd>
      </div>
    </dl>
  );
}

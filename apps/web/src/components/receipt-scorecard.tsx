"use client";

import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved, formatPathDuration, formatPoints } from "@/lib/format";

export function ReceiptScorecard({ profile }: { profile: ProfileResponse }) {
  const proofCount = profile.chainProofs?.length ?? 0;
  const gMoved = formatGsMoved(profile.league?.gMovedWei);
  const proofMix =
    profile.publicCard?.proofMix?.length
      ? profile.publicCard.proofMix.join(", ")
      : profile.chainProofs?.map((p) => p.proofType ?? p.questId).join(", ");

  return (
    <div className="mt-4">
      <dl className="receipt-scorecard-hero">
        <div className="receipt-scorecard-hero-stat">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            G$ moved
          </dt>
          <dd>{gMoved}</dd>
        </div>
        <div className="receipt-scorecard-hero-stat">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            League pts
          </dt>
          <dd>{formatPoints(profile.league?.points)}</dd>
        </div>
      </dl>

      <dl className="receipt-scorecard mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Division
          </dt>
          <dd className="font-mono text-base font-semibold tabular-nums">
            {profile.league?.divisionLabel ?? "-"}
            {profile.league?.divisionRank != null
              ? ` · #${profile.league.divisionRank}`
              : ""}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Celoscan proofs
          </dt>
          <dd className="font-mono text-base font-semibold tabular-nums">{proofCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Fastest path
          </dt>
          <dd className="font-mono text-base font-semibold tabular-nums">
            {profile.personalBests?.fastestPathSeconds
              ? formatPathDuration(profile.personalBests.fastestPathSeconds)
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Global rank
          </dt>
          <dd className="font-mono text-base font-semibold tabular-nums">
            {profile.league?.rank != null ? `#${profile.league.rank}` : "-"}
          </dd>
        </div>
        {proofMix ? (
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
              Proof mix
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-foreground">{proofMix}</dd>
          </div>
        ) : null}
        {profile.league?.nextMove ? (
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
              Next move
            </dt>
            <dd className="mt-0.5 text-xs font-semibold text-foreground">
              {profile.league.nextMove}
            </dd>
          </div>
        ) : null}
        {profile.publicCard?.verifiedHuman ? (
          <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-win">
            Verified human on Celo
          </div>
        ) : null}
      </dl>
    </div>
  );
}

"use client";

import { Lock } from "@phosphor-icons/react";
import { COMMITMENT_BONUS_POINTS, G_DOLLAR_USE_PATHS } from "@goodpath/shared";
import type { DailyCommitmentState } from "@goodpath/shared";
import { TabLink } from "@/components/tab-link";

export function DailyCommitLocked({
  commitment,
}: {
  commitment: DailyCommitmentState;
}) {
  const path = G_DOLLAR_USE_PATHS.find((p) => p.id === commitment.useId);

  return (
    <div className="commit-locked-banner" role="status">
      <div className="commit-locked-head">
        <Lock className="h-4 w-4" weight="bold" aria-hidden />
        <p className="commit-locked-title">
          Locked: <strong>{commitment.label}</strong>
        </p>
      </div>
      <p className="commit-locked-sub">
        You bet on {commitment.label.toLowerCase()}. +{COMMITMENT_BONUS_POINTS} pts when it
        lands on-chain.
      </p>
      {path?.hash ? (
        <TabLink tab="quests" hash={path.hash} className="vibe-cta-pill group">
          Deliver your bet
        </TabLink>
      ) : null}
    </div>
  );
}

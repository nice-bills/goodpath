"use client";

import { Gift } from "@phosphor-icons/react";
import type { ProfileResponse } from "@/lib/api";
import { TabLink } from "@/components/tab-link";
import { hoursUntilClaimReset } from "@/lib/format";

/** Primary home CTA when daily claim is unlocked and pending. */
export function ClaimDueBanner({ profile }: { profile: ProfileResponse }) {
  const claimQuest = profile.quests.find((q) => q.id === "claim");
  const claimDue = claimQuest?.unlocked && !claimQuest.completed;
  if (!claimDue) return null;

  const { hours, minutes } = hoursUntilClaimReset();
  const streak = profile.streak ?? 0;

  return (
    <div className="vibe-claim-due" role="status">
      <div className="vibe-claim-due-icon" aria-hidden>
        <Gift className="h-6 w-6" weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="vibe-claim-due-title">
          {streak > 0 ? "Claim before your streak slips" : "Daily G$ is ready"}
        </p>
        <p className="vibe-claim-due-sub">
          Window resets in{" "}
          <span className="font-mono tabular-nums">
            {hours}h {minutes}m
          </span>
          . This is the move that keeps you on the board.
        </p>
      </div>
      <TabLink tab="quests" hash="claim" className="vibe-claim-due-cta">
        Claim now
      </TabLink>
    </div>
  );
}

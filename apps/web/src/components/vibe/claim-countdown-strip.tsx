"use client";

import { Clock } from "@phosphor-icons/react";
import { useClaimCountdown } from "@/hooks/use-claim-countdown";
import { TabLink } from "@/components/tab-link";
import type { ProfileResponse } from "@/lib/api";

export function ClaimCountdownStrip({ profile }: { profile?: ProfileResponse }) {
  const countdown = useClaimCountdown();
  const claimQuest = profile?.quests.find((q) => q.id === "claim");
  const claimDue = claimQuest?.unlocked && !claimQuest.completed;

  return (
    <div className={`vibe-countdown-strip ${claimDue ? "vibe-countdown-strip-hot" : ""}`}>
      <Clock className="h-4 w-4 shrink-0" weight="duotone" aria-hidden />
      <p className="vibe-countdown-strip-text">
        {claimDue ? (
          <>
            Daily claim window · resets in{" "}
            <span className="font-mono tabular-nums">{countdown.label}</span>
          </>
        ) : (
          <>
            Next claim window in{" "}
            <span className="font-mono tabular-nums">{countdown.label}</span>
          </>
        )}
      </p>
      {claimDue && profile ? (
        <TabLink tab="quests" hash="claim" className="vibe-countdown-strip-cta">
          Claim
        </TabLink>
      ) : null}
    </div>
  );
}

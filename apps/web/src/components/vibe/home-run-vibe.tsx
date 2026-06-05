"use client";

import { TabLink } from "@/components/tab-link";
import { ArrowRight, Fire } from "@phosphor-icons/react";
import type { ProfileResponse } from "@/lib/api";
import { formatPoints } from "@/lib/format";
import { ClaimDueBanner } from "@/components/vibe/claim-due-banner";
import { HomeFlexMoment } from "@/components/vibe/home-flex-moment";
import { RunPulseFeed } from "@/components/vibe/run-pulse-feed";
import { RunPressure } from "@/components/vibe/run-pressure";
import { RunRivalCard } from "@/components/run-rival-card";
import { CreateRunForm } from "@/components/vibe/create-run-form";
import { RunsHeatingUp } from "@/components/vibe/runs-heating-up";
import { ReturnPulseBanner } from "@/components/vibe/return-pulse-banner";
import { useReturnPulse } from "@/hooks/use-return-pulse";

export function HomeRunVibe({ profile }: { profile: ProfileResponse }) {
  const league = profile.league;
  const streak = profile.streak ?? 0;
  const nextQuest = profile.quests.find((q) => !q.completed && q.unlocked);
  const pathDone = Boolean(profile.pathCompletedAt);

  const claimQuest = profile.quests.find((q) => q.id === "claim");
  const claimDue = claimQuest?.unlocked && !claimQuest.completed;
  const { pulse, dismiss } = useReturnPulse(profile);

  return (
    <div className="vibe-home">
      <CreateRunForm />

      {pulse ? <ReturnPulseBanner pulse={pulse} onDismiss={dismiss} /> : null}

      {claimDue ? <ClaimDueBanner profile={profile} /> : null}

      <RunPressure profile={profile} />

      <HomeFlexMoment profile={profile} />

      <RunPulseFeed />

      <RunsHeatingUp />

      <div className="vibe-you-card">
        <div className="vibe-you-head">
          <span className="vibe-you-badge">Your run</span>
          {streak > 0 ? (
            <span className="vibe-streak-pill">
              <Fire className="h-3.5 w-3.5" weight="fill" aria-hidden />
              {streak} day streak
            </span>
          ) : null}
        </div>

        {league ? (
          <p className="vibe-you-rank">
            <span className="vibe-you-rank-num">
              {league.divisionRank != null ? `#${league.divisionRank}` : "-"}
            </span>
            <span className="vibe-you-rank-meta">
              in {league.divisionLabel ?? "Bronze"} · {formatPoints(league.points)} pts
            </span>
          </p>
        ) : null}

        <p className="vibe-you-hook">
          {pathDone
            ? "Path crushed. Flex the receipt before someone passes you."
            : nextQuest
              ? `${nextQuest.title} is live. Do it before the board cools.`
              : "Pick up where you left off. The league does not wait."}
        </p>

        <TabLink
          tab={pathDone ? "celebrate" : "quests"}
          hash={
            !pathDone && nextQuest
              ? nextQuest.id === "claim"
                ? "claim"
                : `quest-${nextQuest.id}`
              : undefined
          }
          className="vibe-cta-pill group"
        >
          {pathDone
            ? "Flex receipt"
            : claimDue || nextQuest?.id === "claim"
              ? "Claim G$ now"
              : "Keep the run hot"}
          <span className="vibe-cta-icon" aria-hidden>
            <ArrowRight className="h-4 w-4" weight="bold" />
          </span>
        </TabLink>
      </div>

      <RunRivalCard profile={profile} />
    </div>
  );
}

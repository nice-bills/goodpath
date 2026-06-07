"use client";

import { TabLink } from "@/components/tab-link";
import { ArrowRight } from "@phosphor-icons/react";
import type { ProfileResponse } from "@/lib/api";
import { ClaimDueBanner } from "@/components/vibe/claim-due-banner";
import { HomeFlexMoment } from "@/components/vibe/home-flex-moment";
import { RunPulseFeed } from "@/components/vibe/run-pulse-feed";
import { RunPressure } from "@/components/vibe/run-pressure";
import { RunRivalCard } from "@/components/run-rival-card";
import { CreateRunForm } from "@/components/vibe/create-run-form";
import { RunsHeatingUp } from "@/components/vibe/runs-heating-up";
import { ReturnPulseBanner } from "@/components/vibe/return-pulse-banner";
import { TodaysRunCard } from "@/components/todays-run-card";
import { TesterFeedbackBanner } from "@/components/tester-feedback-banner";
import { useReturnPulse } from "@/hooks/use-return-pulse";

export function HomeRunVibe({ profile }: { profile: ProfileResponse }) {
  const pathDone = Boolean(profile.pathCompletedAt);
  const verified = Boolean(profile.completions.verify);

  const claimQuest = profile.quests.find((q) => q.id === "claim");
  const claimDue = claimQuest?.unlocked && !claimQuest.completed;
  const { pulse, dismiss } = useReturnPulse(profile);

  return (
    <div className="vibe-home">
      <CreateRunForm />

      {pulse ? <ReturnPulseBanner pulse={pulse} onDismiss={dismiss} /> : null}

      {claimDue ? <ClaimDueBanner profile={profile} /> : null}

      {verified ? <TodaysRunCard profile={profile} /> : null}

      <RunPressure profile={profile} />

      <HomeFlexMoment profile={profile} />

      <RunPulseFeed />

      <RunsHeatingUp />

      {!verified ? (
        <div className="vibe-you-card">
          <div className="vibe-you-head">
            <span className="vibe-you-badge">Your run</span>
          </div>
          <p className="vibe-you-hook">
            Verify on Celo to unlock today&apos;s G$ run — claim, move, and flex proof.
          </p>
          <TabLink tab="quests" hash="quest-verify" className="vibe-cta-pill group">
            Verify to start
            <span className="vibe-cta-icon" aria-hidden>
              <ArrowRight className="h-4 w-4" weight="bold" />
            </span>
          </TabLink>
        </div>
      ) : pathDone ? (
        <div className="vibe-you-card">
          <div className="vibe-you-head">
            <span className="vibe-you-badge">Path complete</span>
          </div>
          <p className="vibe-you-hook">
            Core path crushed. Keep the daily run alive — claim, move G$, stack proof.
          </p>
          <TabLink tab="celebrate" className="vibe-cta-pill group">
            Flex receipt
            <span className="vibe-cta-icon" aria-hidden>
              <ArrowRight className="h-4 w-4" weight="bold" />
            </span>
          </TabLink>
        </div>
      ) : null}

      <RunRivalCard profile={profile} />

      <TesterFeedbackBanner surface="home" />
    </div>
  );
}

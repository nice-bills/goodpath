"use client";

import { Clock, Lightning } from "@phosphor-icons/react";
import { useClaimCountdown } from "@/hooks/use-claim-countdown";
import { TabLink } from "@/components/tab-link";
import type { ProfileResponse } from "@/lib/api";

function CountdownDigits({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  return (
    <div className="vibe-countdown-digits font-mono" aria-hidden>
      <span className="vibe-countdown-cell">{h}</span>
      <span className="vibe-countdown-sep">:</span>
      <span className="vibe-countdown-cell">{m}</span>
      <span className="vibe-countdown-sep">:</span>
      <span className="vibe-countdown-cell">{s}</span>
    </div>
  );
}

export function ClaimCountdownStrip({ profile }: { profile?: ProfileResponse }) {
  const countdown = useClaimCountdown();
  const claimQuest = profile?.quests.find((q) => q.id === "claim");
  const claimDue = claimQuest?.unlocked && !claimQuest.completed;
  const urgent = countdown.hours < 2;

  return (
    <div
      className={`vibe-countdown-strip ${claimDue ? "vibe-countdown-strip-hot" : ""} ${urgent ? "vibe-countdown-strip-urgent" : ""}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="vibe-countdown-glow" aria-hidden />
      <div className="vibe-countdown-icon" aria-hidden>
        {claimDue ? (
          <Lightning className="h-5 w-5" weight="fill" />
        ) : (
          <Clock className="h-5 w-5" weight="fill" />
        )}
      </div>
      <div className="vibe-countdown-main min-w-0 flex-1">
        <div className="vibe-countdown-top">
          <span className="vibe-countdown-kicker">
            {claimDue ? "Claim live now" : "Claim window"}
          </span>
          {!claimDue ? (
            <span className="vibe-countdown-badge">Ticking</span>
          ) : (
            <span className="vibe-countdown-badge vibe-countdown-badge-live">Live</span>
          )}
        </div>
        <div className="vibe-countdown-row">
          <CountdownDigits
            hours={countdown.hours}
            minutes={countdown.minutes}
            seconds={countdown.seconds}
          />
          <span className="sr-only">{countdown.label} until claim window</span>
          {claimDue ? (
            <p className="vibe-countdown-copy">until reset</p>
          ) : null}
        </div>
        <p className="vibe-countdown-hook">
          {claimDue
            ? "Daily G$ is ready. Grab it before the board cools."
            : urgent
              ? "Less than 2 hours. Be ready to claim on the dot."
              : "First claim of the day sets the tone on the live board."}
        </p>
      </div>
      {claimDue && profile ? (
        <TabLink tab="quests" hash="claim" className="vibe-countdown-strip-cta">
          Claim G$
        </TabLink>
      ) : (
        <TabLink tab="quests" hash="claim" className="vibe-countdown-strip-cta vibe-countdown-strip-cta-ghost">
          Path
        </TabLink>
      )}
    </div>
  );
}

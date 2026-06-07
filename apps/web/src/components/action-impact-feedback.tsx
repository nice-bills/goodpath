"use client";

import {
  deriveDailyRun,
  summarizeActionImpact,
  SUPPORT_ACK_META,
  type QuestId,
} from "@goodpath/shared";
import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved, formatPoints } from "@/lib/format";

export function ActionImpactFeedback({
  profile,
  questId,
  meta,
  hasTx,
}: {
  profile: ProfileResponse;
  questId: QuestId;
  meta?: string | null;
  hasTx?: boolean;
}) {
  const daily =
    profile.dailyRun ??
    deriveDailyRun({
      lastActiveDate: profile.lastActiveDate,
      streak: profile.streak,
      quests: profile.quests,
      completions: profile.completions,
      league: profile.league,
    });

  const impact = summarizeActionImpact({
    questId,
    meta,
    hasTx,
    streak: profile.streak,
    league: profile.league,
    receiptStrength: daily.receiptStrength,
  });

  const gMoved =
    questId === "support" && meta === SUPPORT_ACK_META && !hasTx
      ? "Ack only"
      : formatGsMoved(profile.league?.gMovedWei);

  return (
    <div className="action-impact" role="status">
      <p className="action-impact-headline">{impact.headline}</p>
      <dl className="action-impact-grid">
        <div>
          <dt>League pts</dt>
          <dd>+{formatPoints(impact.pointsGained)}</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{impact.streakLabel}</dd>
        </div>
        <div>
          <dt>G$ moved</dt>
          <dd>{gMoved}</dd>
        </div>
        <div>
          <dt>Receipt</dt>
          <dd>
            {impact.receiptStrength}/5
            {daily.primaryIdentity ? ` · ${daily.primaryIdentity}` : ""}
          </dd>
        </div>
      </dl>
      {impact.rivalGap ? (
        <p className="action-impact-rival">
          {impact.rivalGap.label} is {impact.rivalGap.gap} pt
          {impact.rivalGap.gap === 1 ? "" : "s"} ahead this week.
        </p>
      ) : null}
    </div>
  );
}

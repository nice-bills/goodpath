import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  SUPPORT_ACK_META,
  type QuestId,
} from "./quests.js";

/** Base weekly league points per quest completion (this ISO week). */
export const QUEST_LEAGUE_POINTS: Record<QuestId, number> = {
  connect: 2,
  verify: 8,
  claim: 10,
  tip: 6,
  support: 6,
  deploy: 12,
};

/** Bonus when support includes on-chain G$ transfer (vs visit ack). */
export const SUPPORT_TX_BONUS = 4;

/** Deploy stream scores higher than save — productive G$ flow. */
export const DEPLOY_STREAM_BONUS = 6;

/** Deploy save uses base deploy points (no extra bonus). */
export const DEPLOY_SAVE_BONUS = 0;

/** League pts credited to referrer when a referred wallet completes the path this week. */
export const REFERRAL_PATH_BONUS = 15;

/** Bonus when a daily G$ commitment is delivered on-chain. */
export const COMMITMENT_BONUS_POINTS = 4;

export function leaguePointsForQuest(
  questId: QuestId,
  meta?: string | null,
  hasTx?: boolean,
): number {
  let pts = QUEST_LEAGUE_POINTS[questId] ?? 3;
  if (questId === "support") {
    if (hasTx) pts += SUPPORT_TX_BONUS;
    else if (meta === SUPPORT_ACK_META) pts = Math.max(3, pts - 2);
  }
  if (questId === "deploy") {
    if (meta === DEPLOY_STREAM_META) pts += DEPLOY_STREAM_BONUS;
    else if (meta === DEPLOY_SAVE_META) pts += DEPLOY_SAVE_BONUS;
  }
  return pts;
}

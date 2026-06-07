import {
  QUESTS,
  CORE_PATH_QUEST_IDS,
  CHAIN_PROOF_QUEST_IDS,
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  computeProgress,
  completionsFromIds,
  isQuestUnlocked,
  deriveDailyRun,
} from "@goodpath/shared";
import { sumGsMovedWeiThisWeek } from "../chain/g-moved.js";
import { getRepositories } from "../repository/provider.js";
import { buildLeaguePayload } from "./league.js";
import { proofTypeForQuest } from "./proof-type.js";

export async function buildProfilePayload(address: string) {
  const { profile, referral, proofEvents } = getRepositories();
  const row = profile.getProfile(address);
  const lower = address.toLowerCase();
  const completions = profile.getCompletions(address);
  const completedIds = Object.keys(completions);
  const coreCompleted = CORE_PATH_QUEST_IDS.filter((id) =>
    Boolean(completions[id]),
  ).length;
  const progress = computeProgress(coreCompleted);
  const completionMap = completionsFromIds(completedIds);

  const quests = QUESTS.map((q) => ({
    ...q,
    completed: Boolean(completions[q.id]),
    completedAt: completions[q.id]?.completedAt ?? null,
    txHash: completions[q.id]?.txHash ?? null,
    unlocked: isQuestUnlocked(q.id, completionMap),
  }));

  const deployMeta = completions.deploy?.meta;
  const gMovedWei = await sumGsMovedWeiThisWeek(lower);

  const league = buildLeaguePayload(
    lower,
    row.streak,
    row.path_completed_at,
    completions,
    quests.map((q) => ({
      id: q.id,
      completed: q.completed,
      unlocked: q.unlocked,
    })),
    deployMeta ?? null,
    gMovedWei,
  );

  const chainProofs = CHAIN_PROOF_QUEST_IDS.filter((id) =>
    Boolean(completions[id]?.txHash),
  ).map((id) => {
    const r = completions[id]!;
    return {
      questId: id,
      txHash: r.txHash as string,
      proofType: proofTypeForQuest(id, r.meta, true),
      ...(r.meta ? { meta: r.meta } : {}),
    };
  });

  const recentProofs = proofEvents.listRecent(lower, 5).map((p) => ({
    questId: p.quest_id,
    proofType: p.proof_type,
    txHash: p.tx_hash,
    createdAt: p.created_at,
  }));

  const pathComplete = Boolean(row.path_completed_at);
  const verifiedHuman = Boolean(completions.verify);
  const proofMix = chainProofs.map((p) => p.proofType);

  const dailyRun = deriveDailyRun({
    lastActiveDate: row.last_active_date,
    streak: row.streak,
    quests: quests.map((q) => ({
      id: q.id,
      completed: q.completed,
      unlocked: q.unlocked,
      completedAt: q.completedAt,
    })),
    completions,
    league: {
      points: league.points,
      divisionLabel: league.divisionLabel,
      personAbove: league.personAbove ?? null,
      gMovedWei,
    },
  });

  return {
    address: row.address,
    streak: row.streak,
    lastActiveDate: row.last_active_date,
    pathCompletedAt: row.path_completed_at,
    progress,
    chainProofs,
    completions,
    personalBests: {
      fastestPathSeconds: row.fastest_path_seconds,
      longestStreak: Math.max(row.longest_streak, row.streak),
      claimsThisWeek: profile.countClaimsThisWeek(lower),
    },
    referredBy: row.referred_by,
    referralsCompletedThisWeek: referral.countReferralsCompletedThisWeek(lower),
    league,
    quests,
    publicCard: {
      verifiedHuman,
      streak: row.streak,
      pathComplete,
      weeklyPoints: league.points,
      division: league.division,
      divisionLabel: league.divisionLabel,
      proofMix,
      gMovedWei,
    },
    recentProofs,
    squads: getRepositories().social.listSquadMemberships(lower),
    dailyRun,
  };
}

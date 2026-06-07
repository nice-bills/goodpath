import {
  QUESTS,
  CORE_PATH_QUEST_IDS,
  CHAIN_PROOF_QUEST_IDS,
  computeProgress,
  completionsFromIds,
  isQuestUnlocked,
  nextMoveHint,
  deriveDailyRun,
  currentClaimPeriodDate,
  isCommitmentUseId,
  type QuestId,
} from "@goodpath/shared";
import type { QueryCtx } from "../_generated/server";
import { normalizeAddress } from "./dates";
import type { SeasonContext } from "./leagueLogic";
import { proofTypeForQuest } from "./proofType";
import { buildLeagueStanding, loadCompletions } from "./leagueLogic";
import { countReferralsCompletedThisWeek } from "./referrals";
import { getCommitmentForPeriod } from "./commitmentLogic";

export async function buildProfilePayload(
  ctx: QueryCtx,
  address: string,
  season: SeasonContext,
) {
  const lower = normalizeAddress(address);
  const profile = await getProfileRow(ctx, lower);
  if (!profile) {
    return await emptyProfilePayload(ctx, lower, season);
  }
  const completions = await loadCompletions(ctx, lower);
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
  const gMovedWei = resolveGMovedWei(profile, completions, season.weekStart);

  const standing = await buildLeagueStanding(
    ctx,
    lower,
    profile.streak,
    profile.pathCompletedAt,
    completions,
    season,
  );

  const league = {
    ...standing,
    gMovedWei,
    nextMove: nextMoveHint({
      points: standing.points,
      quests: quests.map((q) => ({
        id: q.id as QuestId,
        completed: q.completed,
        unlocked: q.unlocked,
      })),
      hasStreamProof: deployMeta === "deploy_stream",
      hasSaveProof: deployMeta === "deploy_save",
    }),
  };

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

  const proofRows = await ctx.db
    .query("proofEvents")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .order("desc")
    .take(5);

  const recentProofs = proofRows.map((p) => ({
    questId: p.questId,
    proofType: p.proofType,
    txHash: p.txHash ?? null,
    createdAt: p.createdAt,
  }));

  const pathComplete = Boolean(profile.pathCompletedAt);
  const verifiedHuman = Boolean(completions.verify);
  const proofMix = chainProofs.map((p) => p.proofType);

  const referralsCompletedThisWeek = await countReferralsCompletedThisWeek(
    ctx,
    lower,
    season.weekStart,
  );

  const squads = await ctx.db
    .query("squadMemberships")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .collect();

  const claimPeriod = currentClaimPeriodDate();
  const commitmentRow = await getCommitmentForPeriod(ctx, lower, claimPeriod);

  const dailyRun = deriveDailyRun({
    lastActiveDate: profile.lastActiveDate ?? null,
    streak: profile.streak,
    quests: quests.map((q) => ({
      id: q.id as QuestId,
      completed: q.completed,
      unlocked: q.unlocked,
      completedAt: q.completedAt,
    })),
    completions,
    league: {
      points: league.points,
      divisionLabel: league.divisionLabel,
      personAbove: league.personAbove ?? null,
      gMovedWei: league.gMovedWei,
    },
    today: claimPeriod,
    commitment:
      commitmentRow && isCommitmentUseId(commitmentRow.useId)
        ? {
            useId: commitmentRow.useId,
            committedAt: commitmentRow.committedAt,
            fulfilled: Boolean(commitmentRow.fulfilledAt),
            fulfilledAt: commitmentRow.fulfilledAt ?? null,
          }
        : null,
  });

  return {
    address: profile.address,
    streak: profile.streak,
    lastActiveDate: profile.lastActiveDate ?? null,
    pathCompletedAt: profile.pathCompletedAt ?? null,
    progress,
    chainProofs,
    completions,
    personalBests: {
      fastestPathSeconds: profile.fastestPathSeconds ?? null,
      longestStreak: Math.max(profile.longestStreak, profile.streak),
      claimsThisWeek: countClaimsThisWeek(completions, season.weekStart),
    },
    referredBy: profile.referredBy ?? null,
    referralsCompletedThisWeek,
    league,
    quests,
    publicCard: {
      verifiedHuman,
      streak: profile.streak,
      pathComplete,
      weeklyPoints: league.points,
      division: league.division,
      divisionLabel: league.divisionLabel,
      proofMix,
      gMovedWei,
    },
    recentProofs,
    squads: squads.map((s) => ({
      squad_id: s.squadId,
      address: s.address,
      role: s.role,
      joined_at: s.joinedAt,
    })),
    dailyRun,
  };
}

function resolveGMovedWei(
  profile: {
    gMovedWeiWeekStart?: string;
    gMovedWeiTotal?: string;
  },
  completions: Record<string, { gAmountWei?: string } & { completedAt: string }>,
  weekStart: string,
): string {
  let total = 0n;
  for (const [questId, row] of Object.entries(completions)) {
    if (!["tip", "support", "deploy"].includes(questId)) continue;
    if (row.completedAt.slice(0, 10) < weekStart) continue;
    const rowWithWei = row as { gAmountWei?: string };
    if (rowWithWei.gAmountWei && rowWithWei.gAmountWei !== "0") {
      total += BigInt(rowWithWei.gAmountWei);
    }
  }

  if (profile.gMovedWeiWeekStart === weekStart && profile.gMovedWeiTotal) {
    try {
      const cached = BigInt(profile.gMovedWeiTotal);
      if (cached > total) return profile.gMovedWeiTotal;
    } catch {
      /* fall through */
    }
  }

  return total.toString();
}

function countClaimsThisWeek(
  completions: Record<string, { completedAt: string }>,
  weekStart: string,
): number {
  const claim = completions.claim;
  if (!claim) return 0;
  return claim.completedAt.slice(0, 10) >= weekStart ? 1 : 0;
}

async function getProfileRow(ctx: QueryCtx, lower: string) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .first();
}

async function emptyProfilePayload(
  ctx: QueryCtx,
  lower: string,
  season: SeasonContext,
) {
  const completionMap = completionsFromIds([]);
  const completions: Record<string, never> = {};
  const quests = QUESTS.map((q) => ({
    ...q,
    completed: false,
    completedAt: null,
    txHash: null,
    unlocked: isQuestUnlocked(q.id, completionMap),
  }));

  const standing = await buildLeagueStanding(ctx, lower, 0, null, completions, season);

  const league = {
    ...standing,
    gMovedWei: "0",
    nextMove: nextMoveHint({
      points: standing.points,
      quests: quests.map((q) => ({
        id: q.id as QuestId,
        completed: q.completed,
        unlocked: q.unlocked,
      })),
      hasStreamProof: false,
      hasSaveProof: false,
    }),
  };

  const dailyRun = deriveDailyRun({
    lastActiveDate: null,
    streak: 0,
    quests: quests.map((q) => ({
      id: q.id as QuestId,
      completed: q.completed,
      unlocked: q.unlocked,
      completedAt: q.completedAt,
    })),
    completions,
    league: {
      points: league.points,
      divisionLabel: league.divisionLabel,
      personAbove: league.personAbove ?? null,
      gMovedWei: league.gMovedWei,
    },
  });

  return {
    address: lower,
    streak: 0,
    lastActiveDate: null,
    pathCompletedAt: null,
    progress: 0,
    chainProofs: [],
    completions: {},
    personalBests: {
      fastestPathSeconds: null,
      longestStreak: 0,
      claimsThisWeek: 0,
    },
    referredBy: null,
    referralsCompletedThisWeek: 0,
    league,
    quests,
    publicCard: {
      verifiedHuman: false,
      streak: 0,
      pathComplete: false,
      weeklyPoints: league.points,
      division: league.division,
      divisionLabel: league.divisionLabel,
      proofMix: [],
      gMovedWei: "0",
    },
    recentProofs: [],
    squads: [],
    dailyRun,
  };
}

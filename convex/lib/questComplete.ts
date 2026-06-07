import {
  CORE_PATH_QUEST_IDS,
  completionsFromIds,
  prerequisitesMet,
  type QuestId,
} from "@goodpath/shared";
import type { MutationCtx } from "../_generated/server";
import { todayUtc, yesterdayUtc, normalizeAddress, getWeekStartUtc } from "./dates";
import { ensureProfile } from "./ensureProfile";
import { proofTypeForQuest } from "./proofType";
import { syncLeagueAfterQuest } from "./leagueWrites";

export class QuestPrerequisiteError extends Error {
  constructor(public missing: QuestId) {
    super(`Complete quest "${missing}" first`);
    this.name = "QuestPrerequisiteError";
  }
}

export async function completeQuestRecord(
  ctx: MutationCtx,
  address: string,
  questId: QuestId,
  txHash?: string | null,
  meta?: string | null,
  gAmountWei?: string | null,
): Promise<{ streak: number; pathComplete: boolean }> {
  const lower = normalizeAddress(address);
  const profile = await ensureProfile(ctx, lower);

  const existing = await ctx.db
    .query("questCompletions")
    .withIndex("by_address_quest", (q) =>
      q.eq("address", lower).eq("questId", questId),
    )
    .first();

  if (existing) {
    return {
      streak: profile.streak,
      pathComplete: Boolean(profile.pathCompletedAt),
    };
  }

  const allCompletions = await ctx.db
    .query("questCompletions")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .collect();
  const completionMap = completionsFromIds(allCompletions.map((c) => c.questId));

  const prereq = prerequisitesMet(questId, completionMap);
  if (!prereq.ok) {
    throw new QuestPrerequisiteError(prereq.missing);
  }

  const now = new Date().toISOString();
  await ctx.db.insert("questCompletions", {
    address: lower,
    questId,
    txHash: txHash ?? undefined,
    meta: meta ?? undefined,
    completedAt: now,
    gAmountWei: gAmountWei ?? undefined,
  });

  if (!profile.pathStartedAt) {
    await ctx.db.patch("profiles", profile._id, { pathStartedAt: now });
  }

  const streak = await touchStreak(ctx, lower, profile);

  let pathComplete = Boolean(profile.pathCompletedAt);
  const coreIds = new Set(allCompletions.map((c) => c.questId));
  coreIds.add(questId);
  const coreDone = CORE_PATH_QUEST_IDS.filter((id) => coreIds.has(id)).length;

  if (coreDone >= CORE_PATH_QUEST_IDS.length && !profile.pathCompletedAt) {
    const completedAtMs = new Date(now).getTime();
    const started = profile.pathStartedAt
      ? new Date(profile.pathStartedAt).getTime()
      : completedAtMs;
    const durationSec = Math.max(
      1,
      Math.round((completedAtMs - started) / 1000),
    );
    const fastest =
      profile.fastestPathSeconds == null
        ? durationSec
        : Math.min(profile.fastestPathSeconds, durationSec);

    await ctx.db.patch("profiles", profile._id, {
      pathCompletedAt: now,
      fastestPathSeconds: fastest,
    });
    pathComplete = true;
  }

  const proofType = proofTypeForQuest(questId, meta, Boolean(txHash));
  await ctx.db.insert("proofEvents", {
    address: lower,
    questId,
    proofType,
    txHash: txHash ?? undefined,
    meta: meta ?? undefined,
    createdAt: now,
  });

  await ctx.db.insert("receiptEvents", {
    address: lower,
    kind: "quest_complete",
    payload: JSON.stringify({
      questId,
      proofType,
      txHash: txHash ?? null,
    }),
    createdAt: now,
  });

  if (gAmountWei && gAmountWei !== "0" && ["tip", "support", "deploy"].includes(questId)) {
    await updateGMovedCache(ctx, lower, gAmountWei);
  }

  await syncLeagueAfterQuest(ctx, lower);

  return { streak, pathComplete };
}

async function touchStreak(
  ctx: MutationCtx,
  lower: string,
  profile: { _id: import("../_generated/dataModel").Id<"profiles">; streak: number; lastActiveDate?: string; longestStreak: number },
): Promise<number> {
  const today = todayUtc();
  let streak = profile.streak;

  if (profile.lastActiveDate === today) {
    return streak;
  }
  if (profile.lastActiveDate === yesterdayUtc()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const longest = Math.max(profile.longestStreak, streak);
  await ctx.db.patch("profiles", profile._id, {
    streak,
    lastActiveDate: today,
    longestStreak: longest,
  });
  return streak;
}

async function updateGMovedCache(
  ctx: MutationCtx,
  lower: string,
  gAmountWei: string,
): Promise<void> {
  const weekStart = getWeekStartUtc();
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .first();
  if (!profile) return;

  let total = 0n;
  if (profile.gMovedWeiWeekStart === weekStart && profile.gMovedWeiTotal) {
    total = BigInt(profile.gMovedWeiTotal);
  }
  total += BigInt(gAmountWei);

  await ctx.db.patch("profiles", profile._id, {
    gMovedWeiWeekStart: weekStart,
    gMovedWeiTotal: total.toString(),
  });
}

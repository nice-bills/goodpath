import { internalMutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { SEEDED_DIVISION_COHORT, type LeagueDivision } from "@goodpath/shared";
import { ensureSeason, ensureSeededDivisionEntries } from "./lib/leagueWrites";
import { getPeriodId, getWeekStartUtc } from "./lib/dates";
import {
  JUDGE_DEMO_META,
  allSeededAddresses,
  seededIdToAddress,
} from "./lib/seeded";

const DEMO_TX = "0x00000000000000000000000000000000000000de0000000000000000000000";

type JudgeMove = {
  seedId: string;
  questId: string;
  hoursAgo: number;
  txHash?: string;
};

type JudgePath = {
  seedId: string;
  hoursAgo: number;
  streak: number;
};

type JudgeRun = {
  seedId: string;
  title: string;
  hoursAgo: number;
};

const JUDGE_MOVES: JudgeMove[] = [
  { seedId: "seed-g7", questId: "claim", hoursAgo: 1 },
  { seedId: "seed-g6", questId: "claim", hoursAgo: 2, txHash: DEMO_TX },
  { seedId: "seed-g5", questId: "support", hoursAgo: 3, txHash: DEMO_TX },
  { seedId: "seed-g4", questId: "claim", hoursAgo: 4 },
  { seedId: "seed-g3", questId: "tip", hoursAgo: 5, txHash: DEMO_TX },
  { seedId: "seed-g2", questId: "deploy", hoursAgo: 7, txHash: DEMO_TX },
  { seedId: "seed-g1", questId: "claim", hoursAgo: 9 },
  { seedId: "seed-s7", questId: "deploy", hoursAgo: 6, txHash: DEMO_TX },
  { seedId: "seed-s1", questId: "claim", hoursAgo: 11 },
  { seedId: "seed-s3", questId: "tip", hoursAgo: 14, txHash: DEMO_TX },
  { seedId: "seed-b2", questId: "claim", hoursAgo: 16 },
  { seedId: "seed-b1", questId: "claim", hoursAgo: 20 },
];

const JUDGE_PATHS: JudgePath[] = [
  { seedId: "seed-g7", hoursAgo: 8, streak: 12 },
  { seedId: "seed-g6", hoursAgo: 18, streak: 9 },
  { seedId: "seed-g5", hoursAgo: 26, streak: 7 },
];

const JUDGE_RUNS: JudgeRun[] = [
  { seedId: "seed-g7", title: "7-day claim streak, zero misses", hoursAgo: 2 },
  { seedId: "seed-g6", title: "Tip 3 builders before Friday", hoursAgo: 5 },
  { seedId: "seed-g5", title: "Gold flex before the week resets", hoursAgo: 8 },
  { seedId: "seed-g4", title: "Deploy savings + stream this week", hoursAgo: 12 },
  { seedId: "seed-s1", title: "Beat Silver median by 10 pts", hoursAgo: 15 },
  { seedId: "seed-b4", title: "First full path in Bronze", hoursAgo: 22 },
];

function hoursAgoIso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3_600_000).toISOString();
}

async function clearJudgeDemoRows(ctx: MutationCtx, periodId: string) {
  const seeded = new Set(allSeededAddresses());

  for (const row of await ctx.db.query("questCompletions").collect()) {
    if (!seeded.has(row.address.toLowerCase())) continue;
    if (!row.meta?.includes("judgeDemo")) continue;
    await ctx.db.delete("questCompletions", row._id);
  }

  for (const row of await ctx.db.query("profiles").collect()) {
    if (!seeded.has(row.address.toLowerCase())) continue;
    await ctx.db.delete("profiles", row._id);
  }

  for (const row of await ctx.db.query("weeklyGoals").collect()) {
    if (!seeded.has(row.address.toLowerCase())) continue;
    if (row.periodId !== periodId) continue;
    await ctx.db.delete("weeklyGoals", row._id);
  }
}

/** Dev/admin: seed division benchmark runners for the current season. */
export const divisionRunners = internalMutation({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    seasonId: v.id("seasons"),
    periodId: v.string(),
    cohortCounts: v.record(v.string(), v.number()),
  }),
  handler: async (ctx) => {
    const periodId = getPeriodId();
    const weekStart = getWeekStartUtc();
    const seasonId = await ensureSeason(ctx, periodId, weekStart);

    const divisions: LeagueDivision[] = ["bronze", "silver", "gold"];
    for (const division of divisions) {
      await ensureSeededDivisionEntries(ctx, seasonId, division);
    }

    return {
      ok: true as const,
      seasonId,
      periodId,
      cohortCounts: Object.fromEntries(
        divisions.map((d) => [d, SEEDED_DIVISION_COHORT[d].length]),
      ),
    };
  },
});

/**
 * Judge demo: division board + benchmark moves, flexes, and public runs.
 * Live feed shows labeled benchmarks only (not fake humans).
 */
export const judgeDemo = internalMutation({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    periodId: v.string(),
    moves: v.number(),
    paths: v.number(),
    runs: v.number(),
  }),
  handler: async (ctx) => {
    const periodId = getPeriodId();
    const weekStart = getWeekStartUtc();
    const seasonId = await ensureSeason(ctx, periodId, weekStart);

    const divisions: LeagueDivision[] = ["bronze", "silver", "gold"];
    for (const division of divisions) {
      await ensureSeededDivisionEntries(ctx, seasonId, division);
    }

    await clearJudgeDemoRows(ctx, periodId);

    let moves = 0;
    for (const move of JUDGE_MOVES) {
      const address = seededIdToAddress(move.seedId);
      const completedAt = hoursAgoIso(move.hoursAgo);
      await ctx.db.insert("questCompletions", {
        address,
        questId: move.questId,
        txHash: move.txHash,
        meta: JUDGE_DEMO_META,
        completedAt,
      });
      moves += 1;
    }

    let paths = 0;
    for (const path of JUDGE_PATHS) {
      const address = seededIdToAddress(path.seedId);
      const completedAt = hoursAgoIso(path.hoursAgo);
      await ctx.db.insert("profiles", {
        address,
        streak: path.streak,
        longestStreak: path.streak,
        pathCompletedAt: completedAt,
        createdAt: completedAt,
      });
      await ctx.db.insert("questCompletions", {
        address,
        questId: "deploy",
        txHash: DEMO_TX,
        meta: JUDGE_DEMO_META,
        completedAt,
      });
      paths += 1;
    }

    let runs = 0;
    for (const run of JUDGE_RUNS) {
      const address = seededIdToAddress(run.seedId);
      const createdAt = hoursAgoIso(run.hoursAgo);
      await ctx.db.insert("weeklyGoals", {
        address,
        title: run.title,
        periodId,
        isPublic: true,
        createdAt,
        updatedAt: createdAt,
      });
      runs += 1;
    }

    return { ok: true as const, periodId, moves, paths, runs };
  },
});

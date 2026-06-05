import { query } from "./_generated/server";
import { v } from "convex/values";
import { divisionLabel, type LeagueDivision } from "@goodpath/shared";

const leaderRow = v.object({
  id: v.string(),
  rank: v.number(),
  handle: v.string(),
  address: v.string(),
  points: v.number(),
  division: v.string(),
  divisionLabel: v.string(),
  displayLabel: v.optional(v.string()),
  isSeeded: v.boolean(),
});

const flexItem = v.object({
  id: v.string(),
  handle: v.string(),
  kind: v.string(),
  headline: v.string(),
  completedAt: v.string(),
  hasProof: v.boolean(),
});

function shortAddress(address: string): string {
  const a = address.toLowerCase();
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const FLEX_HEADLINES: Record<string, string> = {
  path_complete: "crushed the full G$ path",
  deploy: "put G$ to work on-chain",
  tip: "tipped with real G$",
  claim: "claimed daily G$",
  support: "backed a pool",
};

export const weeklyLeaderboard = query({
  args: {
    periodId: v.string(),
    limit: v.optional(v.number()),
    viewerAddress: v.optional(v.string()),
  },
  returns: v.object({
    periodId: v.string(),
    rows: v.array(leaderRow),
    viewerAddress: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 24, 40);
    const viewer = args.viewerAddress?.toLowerCase();

    const season = await ctx.db
      .query("seasons")
      .withIndex("by_period", (q) => q.eq("periodId", args.periodId))
      .first();

    if (!season) {
      return { periodId: args.periodId, rows: [], viewerAddress: viewer };
    }

    const entries = await ctx.db
      .query("divisionEntries")
      .withIndex("by_season", (q) => q.eq("seasonId", season._id))
      .collect();

    const sorted = [...entries].sort(
      (a, b) => b.points - a.points || a.address.localeCompare(b.address),
    );

    const rows = sorted.slice(0, limit).map((row, index) => {
      const division = row.division as LeagueDivision;
      return {
        id: row._id,
        rank: index + 1,
        handle: shortAddress(row.address),
        address: row.address,
        points: row.points,
        division: row.division,
        divisionLabel: divisionLabel(division),
        displayLabel: row.label,
        isSeeded: row.isSeeded,
      };
    });

    return {
      periodId: args.periodId,
      rows,
      viewerAddress: viewer,
    };
  },
});

export const recentFlexes = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({ flexes: v.array(flexItem) }),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 16, 24);
    const flexes: Array<{
      id: string;
      handle: string;
      kind: string;
      headline: string;
      completedAt: string;
      hasProof: boolean;
    }> = [];

    const profiles = await ctx.db.query("profiles").order("desc").take(40);
    for (const profile of profiles) {
      if (!profile.pathCompletedAt) continue;
      flexes.push({
        id: `path-${profile._id}`,
        handle: shortAddress(profile.address),
        kind: "path_complete",
        headline: FLEX_HEADLINES.path_complete!,
        completedAt: profile.pathCompletedAt,
        hasProof: true,
      });
    }

    const quests = await ctx.db.query("questCompletions").order("desc").take(60);
    for (const row of quests) {
      if (!["deploy", "tip", "claim", "support"].includes(row.questId)) continue;
      flexes.push({
        id: row._id,
        handle: shortAddress(row.address),
        kind: row.questId,
        headline: FLEX_HEADLINES[row.questId] ?? "moved on the path",
        completedAt: row.completedAt,
        hasProof: Boolean(row.txHash),
      });
    }

    flexes.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

    const seen = new Set<string>();
    const deduped = [];
    for (const item of flexes) {
      const key = `${item.handle}:${item.kind}:${item.completedAt.slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= limit) break;
    }

    return { flexes: deduped };
  },
});

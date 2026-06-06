import { query } from "./_generated/server";
import { v } from "convex/values";
import { benchmarkHandle, seededLabelByAddress } from "./lib/seeded";

const runEvent = v.object({
  id: v.string(),
  handle: v.string(),
  verb: v.string(),
  questId: v.string(),
  completedAt: v.string(),
  hasProof: v.boolean(),
  isSeeded: v.boolean(),
});

const QUEST_VERBS: Record<string, string> = {
  connect: "joined the run",
  verify: "verified",
  claim: "claimed daily G$",
  tip: "tipped on-chain",
  support: "backed a pool",
  deploy: "put G$ to work",
};

function shortAddress(address: string): string {
  const a = address.toLowerCase();
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export const recentRuns = query({
  args: {
    limit: v.optional(v.number()),
    /** ISO timestamp — pass from client so the query stays cache-friendly. */
    since: v.string(),
  },
  returns: v.object({
    events: v.array(runEvent),
    last24hCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 12, 24);
    const cutoff = args.since;

    const rows = await ctx.db.query("questCompletions").order("desc").take(100);

    let last24hCount = 0;
    const events = [];

    for (const row of rows) {
      if (row.completedAt >= cutoff) last24hCount += 1;
      if (events.length >= limit) continue;
      const benchLabel = seededLabelByAddress(row.address);
      events.push({
        id: row._id,
        handle: benchLabel ? benchmarkHandle(benchLabel) : shortAddress(row.address),
        verb: QUEST_VERBS[row.questId] ?? "moved on the path",
        questId: row.questId,
        completedAt: row.completedAt,
        hasProof: Boolean(row.txHash),
        isSeeded: Boolean(benchLabel),
      });
    }

    return { events, last24hCount };
  },
});

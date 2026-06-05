import { query } from "./_generated/server";
import { impactStats } from "./lib/returns";

const QUEST_IDS = [
  "connect",
  "verify",
  "claim",
  "tip",
  "support",
  "deploy",
] as const;

export const impact = query({
  args: {},
  returns: impactStats,
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();

    const pathsCompleted = profiles.filter((p) => p.pathCompletedAt).length;
    const walletsOnPath = profiles.length;

    let questCompletions = 0;
    let tipsSent = 0;
    let chainProofCount = 0;

    for (const questId of QUEST_IDS) {
      const rows = await ctx.db
        .query("questCompletions")
        .withIndex("by_quest", (q) => q.eq("questId", questId))
        .collect();
      questCompletions += rows.length;
      if (
        questId === "tip" ||
        questId === "support" ||
        questId === "deploy"
      ) {
        const withTx = rows.filter((c) => c.txHash);
        if (questId === "tip") {
          tipsSent = withTx.length;
        }
        chainProofCount += withTx.length;
      }
    }

    return {
      pathsCompleted,
      questCompletions,
      tipsSent,
      chainProofCount,
      walletsOnPath,
    };
  },
});

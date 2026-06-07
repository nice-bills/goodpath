import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { parseWalletAddress } from "./lib/address";
import { isCommitmentUseId } from "@goodpath/shared";
import { assertCanCommit } from "./lib/commitmentLogic";

export const commitDailyMove = mutation({
  args: {
    address: v.string(),
    useId: v.string(),
    claimPeriod: v.string(),
  },
  returns: v.object({
    ok: v.literal(true),
    useId: v.string(),
    claimPeriod: v.string(),
    committedAt: v.string(),
  }),
  handler: async (ctx, args) => {
    const address = parseWalletAddress(args.address);
    const claimPeriod = args.claimPeriod.trim();
    const useId = args.useId.trim();

    if (!claimPeriod) {
      throw new Error("Invalid claim period");
    }

    if (!isCommitmentUseId(useId)) {
      throw new Error("Invalid commitment");
    }
    await assertCanCommit(ctx, address, claimPeriod, useId);

    const now = new Date().toISOString();
    await ctx.db.insert("dailyCommitments", {
      address,
      claimPeriod,
      useId,
      committedAt: now,
      potStatus: "none",
    });

    await ctx.db.insert("receiptEvents", {
      address,
      kind: "daily_commit",
      payload: JSON.stringify({ useId, claimPeriod }),
      createdAt: now,
    });

    return {
      ok: true as const,
      useId,
      claimPeriod,
      committedAt: now,
    };
  },
});

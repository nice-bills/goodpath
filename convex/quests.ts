import { v, type Infer } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { parseWalletAddress } from "./lib/address";
import { questCompleteResult } from "./lib/returns";

type QuestCompleteResult = Infer<typeof questCompleteResult>;

export const complete = action({
  args: {
    address: v.string(),
    questId: v.string(),
    txHash: v.optional(v.string()),
    meta: v.optional(v.string()),
  },
  returns: questCompleteResult,
  handler: async (ctx, args): Promise<QuestCompleteResult> => {
    const lower = parseWalletAddress(args.address);

    const proof = await ctx.runAction(internal.verify.validate, {
      questId: args.questId,
      address: lower,
      txHash: args.txHash,
      meta: args.meta,
    });

    if (!proof.ok) {
      throw new Error(proof.error);
    }

    let gAmountWei: string | undefined;
    if (
      args.txHash &&
      ["tip", "support", "deploy", "claim"].includes(args.questId)
    ) {
      gAmountWei = await ctx.runAction(internal.verify.sumGsOutflow, {
        address: lower,
        txHash: args.txHash,
      });
    }

    return await ctx.runMutation(internal.questApply.applyComplete, {
      address: lower,
      questId: args.questId,
      txHash: args.txHash,
      meta: args.meta,
      gAmountWei,
    });
  },
});

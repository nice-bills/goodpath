import { v, ConvexError } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { questCompleteResult } from "./lib/returns";
import {
  completeQuestRecord,
  QuestPrerequisiteError,
} from "./lib/questComplete";
import { ensureProfile } from "./lib/ensureProfile";
import type { QuestId } from "@goodpath/shared";

export const applyComplete = internalMutation({
  args: {
    address: v.string(),
    questId: v.string(),
    txHash: v.optional(v.string()),
    meta: v.optional(v.string()),
    gAmountWei: v.optional(v.string()),
  },
  returns: questCompleteResult,
  handler: async (ctx, args) => {
    await ensureProfile(ctx, args.address);

    try {
      const result = await completeQuestRecord(
        ctx,
        args.address,
        args.questId as QuestId,
        args.txHash,
        args.meta,
        args.gAmountWei ?? null,
      );

      await ctx.scheduler.runAfter(0, internal.receipt.recordQuestOnChain, {
        address: args.address,
        questId: args.questId,
        txHash: args.txHash,
      });

      return {
        ok: true as const,
        streak: result.streak,
        pathComplete: result.pathComplete,
      };
    } catch (e) {
      if (e instanceof QuestPrerequisiteError) {
        throw new ConvexError({
          message: e.message,
          missingQuest: e.missing,
        });
      }
      throw e;
    }
  },
});

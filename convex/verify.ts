"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { proofResult } from "./lib/returns";
import { validateQuestProof } from "./verify/registry";
import { sumUserGsOutflowInTx } from "./verify/gsOutflow";
import type { Address } from "./verify/client";
import type { Hash } from "viem";

export const validate = internalAction({
  args: {
    questId: v.string(),
    address: v.string(),
    txHash: v.optional(v.string()),
    meta: v.optional(v.string()),
  },
  returns: proofResult,
  handler: async (_ctx, args) => {
    const user = args.address as Address;
    const result = await validateQuestProof(
      args.questId as Parameters<typeof validateQuestProof>[0],
      user,
      { txHash: args.txHash, meta: args.meta },
    );
    return result;
  },
});

export const sumGsOutflow = internalAction({
  args: {
    address: v.string(),
    txHash: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const wei = await sumUserGsOutflowInTx(
      args.address as Address,
      args.txHash as Hash,
    );
    return wei.toString();
  },
});

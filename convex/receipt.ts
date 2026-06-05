"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import {
  createWalletClient,
  http,
  keccak256,
  parseAbi,
  stringToBytes,
  zeroHash,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
const RECEIPT_ABI = parseAbi([
  "function recordQuest(address user, bytes32 questId, bytes32 txHash)",
  "function recordReferral(address referrer, address referred)",
]);

function questIdBytes32(questId: string): `0x${string}` {
  return keccak256(stringToBytes(questId));
}

function txHashBytes32(txHash?: string | null): `0x${string}` {
  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) return zeroHash;
  return txHash as Hash;
}

function relayerConfigured(): boolean {
  const key = process.env.GOODPATH_RELAYER_PRIVATE_KEY ?? "";
  const hex = key.replace(/^0x/i, "");
  return Boolean(
    process.env.GOODPATH_RECEIPT_ADDRESS && /^[a-fA-F0-9]{64}$/.test(hex),
  );
}

export const recordQuestOnChain = internalAction({
  args: {
    address: v.string(),
    questId: v.string(),
    txHash: v.optional(v.string()),
  },
  returns: v.union(v.null(), v.string()),
  handler: async (_ctx, args) => {
    if (!relayerConfigured()) return null;

    const raw = process.env.GOODPATH_RELAYER_PRIVATE_KEY!.replace(/^0x/i, "");
    const account = privateKeyToAccount(`0x${raw}` as Hash);
    const client = createWalletClient({
      account,
      chain: celo,
      transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org"),
    });
    const receiptAddress = process.env.GOODPATH_RECEIPT_ADDRESS as Address;

    try {
      const hash = await client.writeContract({
        address: receiptAddress,
        abi: RECEIPT_ABI,
        functionName: "recordQuest",
        args: [
          args.address as Address,
          questIdBytes32(args.questId),
          txHashBytes32(args.txHash),
        ],
      });
      console.log("[receipt] recordQuest", args.questId, args.address, hash);
      return hash;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("quest exists")) return null;
      console.error("[receipt] recordQuest failed", args.questId, args.address, e);
      return null;
    }
  },
});

export const recordReferralOnChain = internalAction({
  args: {
    referrer: v.string(),
    referred: v.string(),
  },
  returns: v.union(v.null(), v.string()),
  handler: async (_ctx, args) => {
    if (!relayerConfigured()) return null;

    const raw = process.env.GOODPATH_RELAYER_PRIVATE_KEY!.replace(/^0x/i, "");
    const account = privateKeyToAccount(`0x${raw}` as Hash);
    const client = createWalletClient({
      account,
      chain: celo,
      transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org"),
    });
    const receiptAddress = process.env.GOODPATH_RECEIPT_ADDRESS as Address;

    try {
      const hash = await client.writeContract({
        address: receiptAddress,
        abi: RECEIPT_ABI,
        functionName: "recordReferral",
        args: [args.referrer as Address, args.referred as Address],
      });
      console.log("[receipt] recordReferral", args.referrer, args.referred, hash);
      return hash;
    } catch (e) {
      console.error("[receipt] recordReferral failed", e);
      return null;
    }
  },
});

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
import type { QuestId } from "@goodpath/shared";

const RECEIPT_ABI = parseAbi([
  "function recordQuest(address user, bytes32 questId, bytes32 txHash)",
  "function recordReferral(address referrer, address referred)",
  "function setRival(address user, address rival)",
  "function recordSquadJoin(address user, bytes32 squadId)",
  "function recordSeasonScore(bytes32 seasonId, address user, uint256 points)",
  "function issueReceipt(address user, bytes32 receiptHash)",
]);

function questIdBytes32(questId: QuestId): `0x${string}` {
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

function relayerAccount() {
  const raw = process.env.GOODPATH_RELAYER_PRIVATE_KEY!.replace(/^0x/i, "");
  return privateKeyToAccount(`0x${raw}` as Hash);
}

export async function recordQuestOnChain(
  user: Address,
  questId: QuestId,
  txHash?: string | null,
): Promise<Hash | null> {
  if (!relayerConfigured()) return null;

  const account = relayerAccount();
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
      args: [user, questIdBytes32(questId), txHashBytes32(txHash)],
    });
    console.log("[receipt] recordQuest", questId, user, hash);
    return hash;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("quest exists")) {
      return null;
    }
    console.error("[receipt] recordQuest failed", questId, user, e);
    return null;
  }
}

export async function recordReferralOnChain(
  referrer: Address,
  referred: Address,
): Promise<Hash | null> {
  if (!relayerConfigured()) return null;

  const account = relayerAccount();
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
      args: [referrer, referred],
    });
    console.log("[receipt] recordReferral", referrer, referred, hash);
    return hash;
  } catch (e) {
    console.error("[receipt] recordReferral failed", e);
    return null;
  }
}

export function receiptExplorerUrl(txHash: Hash): string {
  return `https://celoscan.io/tx/${txHash}`;
}

"use node";

import { decodeEventLog, parseAbi, parseUnits, type Address, type Hash } from "viem";
import { celoContracts, publicClient } from "./client";

const ERC20_TRANSFER = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

export async function verifyGsTransferTx(
  user: Address,
  txHash: Hash,
  recipients: Address[],
  minAmountWei: bigint,
): Promise<boolean> {
  if (recipients.length === 0) return false;
  const { g$Contract } = celoContracts();
  const recipientSet = new Set(recipients.map((r) => r.toLowerCase()));
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== g$Contract.toLowerCase()) continue;
    try {
      const event = decodeEventLog({
        abi: ERC20_TRANSFER,
        data: log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      if (event.eventName !== "Transfer") continue;
      const { from, to, value } = event.args;
      if (
        from.toLowerCase() === user.toLowerCase() &&
        recipientSet.has(to.toLowerCase()) &&
        value >= minAmountWei
      ) {
        return true;
      }
    } catch {
      /* continue */
    }
  }
  return false;
}

export async function verifyTipTx(
  user: Address,
  txHash: Hash,
  tipRecipient: Address,
  minAmountWei: bigint,
): Promise<boolean> {
  return verifyGsTransferTx(user, txHash, [tipRecipient], minAmountWei);
}

export function parseRecipientList(
  primary: string | undefined,
  fallback: string | undefined,
): Address[] {
  const raw = primary ?? fallback ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^0x[a-fA-F0-9]{40}$/.test(s))
    .map((s) => s as Address);
}

export function supportRecipients(): Address[] {
  const fromSupport = parseRecipientList(
    process.env.SUPPORT_RECIPIENT,
    process.env.SUPPORT_RECIPIENTS,
  );
  if (fromSupport.length > 0) return fromSupport;
  const tip = (process.env.TIP_RECIPIENT ??
    "0x0000000000000000000000000000000000000001") as Address;
  if (
    tip.toLowerCase() !== "0x0000000000000000000000000000000000000000" &&
    tip.toLowerCase() !== "0x0000000000000000000000000000000000000001"
  ) {
    return [tip];
  }
  return [];
}

export function minTipWei(): bigint {
  return parseUnits(process.env.MIN_TIP_G ?? "0.01", 18);
}

export function minSupportWei(): bigint {
  return parseUnits(
    process.env.MIN_SUPPORT_G ?? process.env.MIN_TIP_G ?? "0.01",
    18,
  );
}

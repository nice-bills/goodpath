"use node";

import { decodeEventLog, type Hash } from "viem";
import {
  celoContracts,
  identityV2ABI,
  publicClient,
  ubiSchemeV2ABI,
  zeroAddress,
  type Address,
} from "./client";

export async function verifyWhitelisted(user: Address): Promise<boolean> {
  const { identityContract } = celoContracts();
  const root = await publicClient.readContract({
    address: identityContract,
    abi: identityV2ABI,
    functionName: "getWhitelistedRoot",
    args: [user],
  });
  return root !== zeroAddress;
}

export async function verifyClaimTx(
  user: Address,
  txHash: Hash,
): Promise<boolean> {
  const { ubiContract } = celoContracts();
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== ubiContract.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: ubiSchemeV2ABI,
        data: log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      if (decoded.eventName === "UBIClaimed") {
        const account = (decoded.args as Record<string, unknown>).account;
        if (
          typeof account === "string" &&
          account.toLowerCase() === user.toLowerCase()
        ) {
          return true;
        }
      }
    } catch {
      /* try next log */
    }
  }

  return receipt.to?.toLowerCase() === ubiContract.toLowerCase();
}

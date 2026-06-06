import { createPublicClient, http, type Hash } from "viem";
import { celo } from "wagmi/chains";

const CELO_RPC = celo.rpcUrls.default.http[0]!;

export const celoPublicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

/** Wait for a Celo tx to mine before Convex verifies the receipt. */
export async function waitForCeloTxReceipt(hash: Hash) {
  return celoPublicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 120_000,
  });
}

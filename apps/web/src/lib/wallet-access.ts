import type { WalletSessionStatus } from "@/hooks/use-wallet-session";

/** Quests / Done require a connected wallet (or demo mode). */
export function canAccessGatedTabs(
  walletStatus: WalletSessionStatus,
  demoActive: boolean,
): boolean {
  return demoActive || walletStatus === "ready";
}

export const CONNECT_TO_CONTINUE_MESSAGE =
  "Connect your wallet on Run to open Claim, Path, and Flex.";

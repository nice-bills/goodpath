"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { usePrivyEmbeddedWalletLink } from "@/hooks/use-privy-embedded-wallet";
import { isPrivyEnabled } from "@/lib/privy-config";
import { pickPrivyWallet } from "@/lib/privy-embedded-wallet";

export type WalletSessionStatus = "disconnected" | "linking" | "ready";

export type WalletSession = {
  status: WalletSessionStatus;
  address: `0x${string}` | undefined;
  /** True when Privy user is signed in but embedded wallet is still being created/linked. */
  isLinking: boolean;
};

/**
 * Single source of truth for “can this user do on-chain quests?”
 * Use instead of ad-hoc `usePrivyWalletAddress` + separate Privy ready checks.
 */
export function useWalletSession(): WalletSession {
  const { address, isConnected } = useAccount();
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { displayAddress, isReady, phase } = usePrivyEmbeddedWalletLink();

  const embedded = pickPrivyWallet(wallets)?.address as `0x${string}` | undefined;
  const wagmiAddress =
    isConnected && address ? (address as `0x${string}`) : undefined;

  const resolved =
    wagmiAddress ??
    (isPrivyEnabled ? (displayAddress as `0x${string}` | undefined) : undefined) ??
    (authenticated && embedded ? embedded : undefined);

  const linking =
    isPrivyEnabled &&
    authenticated &&
    privyReady &&
    !isReady &&
    (phase === "creating" ||
      phase === "linking" ||
      phase === "slow" ||
      (!walletsReady && wallets.length === 0));

  if (resolved) {
    return { status: "ready", address: resolved, isLinking: false };
  }

  if (linking) {
    return { status: "linking", address: undefined, isLinking: true };
  }

  return { status: "disconnected", address: undefined, isLinking: false };
}

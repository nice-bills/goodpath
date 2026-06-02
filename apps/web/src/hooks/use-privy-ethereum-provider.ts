"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { EIP1193Provider } from "viem";
import { isPrivyEnabled } from "@/lib/privy-config";
import { pickPrivyWallet } from "@/lib/privy-embedded-wallet";

/** EIP-1193 provider for Privy embedded wallet (email / Google sign-in). */
export function usePrivyEthereumProvider() {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const embedded = pickPrivyWallet(wallets);

  const query = useQuery({
    queryKey: ["privy-ethereum-provider", embedded?.address],
    enabled: isPrivyEnabled && ready && authenticated && Boolean(embedded),
    queryFn: async () => {
      const provider = await embedded!.getEthereumProvider();
      return provider as EIP1193Provider;
    },
    staleTime: 60_000,
    retry: 3,
    retryDelay: 800,
  });

  return {
    provider: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    walletAddress: embedded?.address as `0x${string}` | undefined,
  };
}

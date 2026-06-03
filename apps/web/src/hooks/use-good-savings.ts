"use client";

import { useQuery } from "@tanstack/react-query";
import { GooddollarSavingsSDK } from "@goodsdks/savings-sdk";
import type { PublicClient } from "viem";
import { useCeloWalletClient } from "@/hooks/use-celo-wallet-client";

/** GoodDollar Savings SDK — Celo mainnet stake only. */
export function useGoodSavingsSDK() {
  const { publicClient, walletClient, address, loading, error } =
    useCeloWalletClient();

  const sdkQuery = useQuery({
    queryKey: ["savings-sdk", address],
    enabled: Boolean(walletClient),
    queryFn: () =>
      new GooddollarSavingsSDK(
        publicClient as PublicClient,
        walletClient as NonNullable<typeof walletClient>,
      ),
    staleTime: Infinity,
    retry: 1,
  });

  return {
    sdk: sdkQuery.data ?? null,
    loading: loading || sdkQuery.isLoading,
    error:
      error ??
      (sdkQuery.error instanceof Error ? sdkQuery.error.message : null),
    mainnetOnly: true,
  };
}

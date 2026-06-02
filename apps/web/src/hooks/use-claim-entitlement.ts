"use client";

import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { CHAIN_DECIMALS, SupportedChains, isSupportedChain } from "@goodsdks/citizen-sdk";
import type { ClaimSDK } from "@goodsdks/citizen-sdk";

export function useClaimEntitlement(
  claimSDK: ClaimSDK | null | undefined,
  chainId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["claim-entitlement", chainId, Boolean(claimSDK)],
    enabled: Boolean(
      enabled && claimSDK && chainId !== undefined && isSupportedChain(chainId),
    ),
    queryFn: async () => {
      const { amount } = await claimSDK!.checkEntitlement();
      const decimals = CHAIN_DECIMALS[chainId as SupportedChains];
      const formatted = formatUnits(amount, decimals);
      return Math.round((Number(formatted) + Number.EPSILON) * 100) / 100;
    },
    staleTime: 30_000,
    retry: 1,
  });
}

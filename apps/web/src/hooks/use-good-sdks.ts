"use client";

import { useQuery } from "@tanstack/react-query";
import { type contractEnv, IdentitySDK, ClaimSDK } from "@goodsdks/citizen-sdk";
import type { PublicClient } from "viem";
import { useCeloWalletClient } from "@/hooks/use-celo-wallet-client";
import { useWalletSession } from "@/hooks/use-wallet-session";

export function useGoodIdentitySDK(env: contractEnv = "development") {
  const { status } = useWalletSession();
  const {
    publicClient,
    walletClient,
    address,
    loading: walletLoading,
    error: walletError,
  } = useCeloWalletClient();

  const query = useQuery({
    queryKey: ["identity-sdk", env, address],
    enabled: Boolean(walletClient && address),
    queryFn: () =>
      IdentitySDK.init({
        publicClient: publicClient as PublicClient,
        walletClient: walletClient!,
        env,
      }),
    staleTime: Infinity,
    retry: 1,
  });

  const error =
    walletError ??
    (query.error instanceof Error ? query.error.message : null) ??
    (status === "ready" && !walletClient && !walletLoading
      ? "Wallet not ready. Reconnect or use MetaMask browser."
      : null);

  return {
    sdk: query.data ?? null,
    loading: walletLoading || query.isLoading,
    error,
  };
}

export function useGoodClaimSDK(env: contractEnv = "development") {
  const { address } = useWalletSession();
  const {
    publicClient,
    walletClient,
    loading: walletLoading,
    error: walletError,
  } = useCeloWalletClient();
  const {
    sdk: identitySDK,
    loading: identityLoading,
    error: identityError,
  } = useGoodIdentitySDK(env);

  const query = useQuery({
    queryKey: ["claim-sdk", env, address, Boolean(identitySDK)],
    enabled: Boolean(walletClient && identitySDK && address),
    queryFn: () =>
      ClaimSDK.init({
        publicClient: publicClient as PublicClient,
        walletClient: walletClient!,
        identitySDK: identitySDK!,
        env,
      }),
    staleTime: Infinity,
    retry: 1,
  });

  const error =
    walletError ??
    identityError ??
    (query.error instanceof Error ? query.error.message : null);

  return {
    sdk: query.data ?? null,
    loading: walletLoading || identityLoading || query.isLoading,
    error,
  };
}

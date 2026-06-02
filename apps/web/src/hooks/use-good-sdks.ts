"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, useConfig, useWalletClient } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { celo } from "wagmi/chains";
import { type contractEnv, IdentitySDK, ClaimSDK } from "@goodsdks/citizen-sdk";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type EIP1193Provider,
  type PublicClient,
  type WalletClient,
} from "viem";
import { getInjectedProvider } from "@/lib/injected-provider";
import { usePrivyEthereumProvider } from "@/hooks/use-privy-ethereum-provider";
import { isPrivyEnabled } from "@/lib/privy-config";

const CELO_RPC = celo.rpcUrls.default.http[0]!;
const publicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

async function resolveWalletClient(
  config: ReturnType<typeof useConfig>,
  address: `0x${string}`,
  wagmiWallet: WalletClient | undefined,
  privyProvider: EIP1193Provider | undefined,
): Promise<WalletClient> {
  if (wagmiWallet) return wagmiWallet;

  if (privyProvider) {
    return createWalletClient({
      account: address,
      chain: celo,
      transport: custom(privyProvider),
    });
  }

  const fromWagmi = await getWalletClient(config, { chainId: celo.id });
  if (fromWagmi) return fromWagmi;

  const injected = getInjectedProvider();
  if (injected) {
    return createWalletClient({
      account: address,
      chain: celo,
      transport: custom(injected),
    });
  }

  throw new Error(
    "Wallet not ready. Wait a few seconds after sign-in, or reconnect with MetaMask.",
  );
}

function useResolvedWalletClient() {
  const config = useConfig();
  const { address, isConnected } = useAccount();
  const { data: wagmiWallet, isLoading: wagmiLoading } = useWalletClient({
    chainId: celo.id,
  });
  const {
    provider: privyProvider,
    loading: privyProviderLoading,
    walletAddress: privyAddress,
  } = usePrivyEthereumProvider();

  const effectiveAddress = address ?? privyAddress;
  const canResolve =
    Boolean(effectiveAddress) &&
    (isConnected || (isPrivyEnabled && Boolean(privyProvider)));

  const query = useQuery({
    queryKey: [
      "wallet-client",
      effectiveAddress,
      wagmiWallet?.account?.address,
      Boolean(privyProvider),
    ],
    enabled: canResolve,
    queryFn: () =>
      resolveWalletClient(
        config,
        effectiveAddress!,
        wagmiWallet,
        privyProvider ?? undefined,
      ),
    staleTime: 30_000,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    publicClient,
    walletClient: query.data ?? null,
    address: effectiveAddress,
    loading:
      canResolve && (wagmiLoading || privyProviderLoading || query.isLoading),
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useGoodIdentitySDK(env: contractEnv = "development") {
  const { isConnected } = useAccount();
  const {
    walletClient,
    address,
    loading: walletLoading,
    error: walletError,
  } = useResolvedWalletClient();

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
    (isConnected && !walletClient && !walletLoading
      ? "Wallet not ready. Reconnect or use MetaMask browser."
      : null);

  return {
    sdk: query.data ?? null,
    loading: walletLoading || query.isLoading,
    error,
  };
}

export function useGoodClaimSDK(env: contractEnv = "development") {
  const { address } = useAccount();
  const { walletClient, loading: walletLoading, error: walletError } =
    useResolvedWalletClient();
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

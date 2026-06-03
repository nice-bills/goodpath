"use client";

import { useQuery } from "@tanstack/react-query";
import { useConfig, useWalletClient } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { celo } from "wagmi/chains";
import {
  createWalletClient,
  custom,
  type EIP1193Provider,
  type WalletClient,
} from "viem";
import { getInjectedProvider } from "@/lib/injected-provider";
import { celoPublicClient } from "@/lib/celo-public-client";
import { usePrivyEthereumProvider } from "@/hooks/use-privy-ethereum-provider";
import { useWalletSession } from "@/hooks/use-wallet-session";
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

/** Single Celo wallet client for GoodSDKs, savings, and on-chain quests. */
export function useCeloWalletClient() {
  const { address, status } = useWalletSession();
  const config = useConfig();
  const { data: wagmiWallet, isLoading: wagmiLoading } = useWalletClient({
    chainId: celo.id,
  });
  const { provider: privyProvider, loading: privyProviderLoading } =
    usePrivyEthereumProvider();

  const ready = status === "ready" && Boolean(address);

  const query = useQuery({
    queryKey: [
      "celo-wallet-client",
      address,
      wagmiWallet?.account?.address,
      Boolean(privyProvider),
    ],
    enabled: ready,
    queryFn: () =>
      resolveWalletClient(
        config,
        address!,
        wagmiWallet,
        privyProvider ?? undefined,
      ),
    staleTime: 30_000,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    publicClient: celoPublicClient,
    walletClient: query.data ?? null,
    address,
    status,
    loading: ready && (wagmiLoading || privyProviderLoading || query.isLoading),
    error: query.error instanceof Error ? query.error.message : null,
  };
}

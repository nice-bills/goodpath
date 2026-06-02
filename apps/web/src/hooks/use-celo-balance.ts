"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { celo } from "wagmi/chains";
import { createPublicClient, formatEther, http } from "viem";
import {
  MIN_CELO_FOR_TX,
  CELO_CAUTION_BELOW,
  hasEnoughCeloForTx,
  isBorderlineCeloForTx,
} from "@/lib/gooddollar-gas";

const publicClient = createPublicClient({
  chain: celo,
  transport: http(celo.rpcUrls.default.http[0]),
});

export { MIN_CELO_FOR_TX, CELO_CAUTION_BELOW };

/** CELO native balance on Celo mainnet for the connected address (via RPC, not MetaMask UI). */
export function useCeloBalance() {
  const { address, chainId, isConnected } = useAccount();
  const walletOnCelo = chainId === celo.id;

  const query = useQuery({
    queryKey: ["celo-balance", address],
    enabled: Boolean(isConnected && address),
    queryFn: async () => {
      const wei = await publicClient.getBalance({ address: address! });
      const formatted = formatEther(wei);
      const amount = Number(formatted);
      return {
        wei,
        formatted,
        amount,
        low: !hasEnoughCeloForTx(amount),
        borderline: isBorderlineCeloForTx(amount),
        enough: hasEnoughCeloForTx(amount),
      };
    },
    refetchInterval: 12_000,
  });

  return {
    ...query.data,
    loading: query.isLoading,
    refetch: query.refetch,
    walletOnCelo,
    /** @deprecated use walletOnCelo */
    onCelo: walletOnCelo,
  };
}

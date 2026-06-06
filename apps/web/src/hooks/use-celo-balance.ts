"use client";

import { useQuery } from "@tanstack/react-query";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useAccount } from "wagmi";
import { celo } from "wagmi/chains";
import { formatEther } from "viem";
import { celoPublicClient } from "@/lib/celo-public-client";
import {
  MIN_CELO_FOR_TX,
  CELO_CAUTION_BELOW,
  hasEnoughCeloForTx,
  isBorderlineCeloForTx,
} from "@/lib/gooddollar-gas";

export { MIN_CELO_FOR_TX, CELO_CAUTION_BELOW };

/** CELO native balance on Celo mainnet for the connected address (via RPC, not MetaMask UI). */
export function useCeloBalance() {
  const { address: sessionAddress, status } = useWalletSession();
  const { chainId } = useAccount();
  const address = sessionAddress;
  const walletOnCelo = chainId === celo.id;

  const query = useQuery({
    queryKey: ["celo-balance", address],
    enabled: status === "ready" && Boolean(address),
    queryFn: async () => {
      const wei = await celoPublicClient.getBalance({ address: address! });
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
    refetchInterval: (query) =>
      query.state.data?.low ? 4_000 : 12_000,
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

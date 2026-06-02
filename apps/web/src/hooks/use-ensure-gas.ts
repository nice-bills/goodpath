"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  ensureGoodDollarGas,
  formatCeloAmount,
  getCeloBalance,
  hasEnoughCeloForTx,
  MIN_CELO_FOR_TX,
  type EnsureGasResult,
} from "@/lib/gooddollar-gas";
import { useCeloBalance } from "@/hooks/use-celo-balance";

export type GasEnsurePhase = "idle" | "checking" | "sponsoring" | "ready" | "failed";

function gasStatusMessage(result: Extract<EnsureGasResult, { ok: true }>): string {
  const bal = formatCeloAmount(result.balance);
  if (result.sponsored) {
    if (result.borderline) {
      return `GoodDollar sent gas (${bal} CELO on Celo). MetaMask may still warn — if it does, add a little CELO from the faucet.`;
    }
    return `GoodDollar covered gas — ${bal} CELO on Celo now.`;
  }
  if (result.borderline) {
    return `${bal} CELO on Celo — borderline for claims. If MetaMask says insufficient, use the Celo faucet.`;
  }
  return `${bal} CELO on Celo (need ~${MIN_CELO_FOR_TX}+ for this step).`;
}

export function useEnsureGoodDollarGas() {
  const { address } = useAccount();
  const { refetch: refetchCelo } = useCeloBalance();
  const [phase, setPhase] = useState<GasEnsurePhase>("idle");
  const [lastResult, setLastResult] = useState<EnsureGasResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPhase("idle");
    setMessage(null);
    setLastResult(null);
  }, [address]);

  const ensureGas = useCallback(async (): Promise<EnsureGasResult> => {
    if (!address) {
      const fail = { ok: false as const, balance: 0, error: "Connect a wallet first." };
      setPhase("failed");
      setLastResult(fail);
      return fail;
    }

    setPhase("checking");
    setMessage("Checking CELO on Celo for this wallet…");

    const before = await getCeloBalance(address);
    if (!hasEnoughCeloForTx(before)) {
      setPhase("sponsoring");
      setMessage(
        `Low gas (${formatCeloAmount(before)} CELO). Asking GoodDollar to fund ~${MIN_CELO_FOR_TX}+ CELO…`,
      );
    }

    const result = await ensureGoodDollarGas(address);

    if (result.ok) {
      setPhase(result.borderline ? "ready" : "ready");
      setMessage(gasStatusMessage(result));
      await refetchCelo();
    } else {
      setPhase("failed");
      setMessage(result.error);
    }

    setLastResult(result);
    return result;
  }, [address, refetchCelo]);

  const reset = useCallback(() => {
    setPhase("idle");
    setMessage(null);
    setLastResult(null);
  }, []);

  return {
    ensureGas,
    reset,
    phase,
    message,
    lastResult,
    isEnsuring: phase === "checking" || phase === "sponsoring",
  };
}

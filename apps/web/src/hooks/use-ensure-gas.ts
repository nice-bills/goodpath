"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletSession } from "@/hooks/use-wallet-session";
import {
  ensureGoodDollarGasShared,
  formatCeloAmount,
  getCeloBalance,
  hasEnoughCeloForTx,
  isBorderlineCeloForTx,
  MIN_CELO_FOR_TX,
  type EnsureGasResult,
} from "@/lib/gooddollar-gas";
import { useCeloBalance } from "@/hooks/use-celo-balance";

export type GasEnsurePhase = "idle" | "checking" | "sponsoring" | "ready" | "failed";

function gasStatusMessage(result: Extract<EnsureGasResult, { ok: true }>): string {
  const bal = formatCeloAmount(result.balance);
  if (result.sponsored) {
    if (result.borderline) {
      return `GoodDollar sent gas (${bal} CELO on Celo). MetaMask may still warn. If it does, add a little CELO from the faucet.`;
    }
    return `GoodDollar covered gas. ${bal} CELO on Celo now.`;
  }
  if (result.borderline) {
    return `${bal} CELO on Celo, borderline for claims. If MetaMask says insufficient, use the Celo faucet.`;
  }
  return `${bal} CELO on Celo (need ~${MIN_CELO_FOR_TX}+ for this step).`;
}

export function useEnsureGoodDollarGas() {
  const { address } = useWalletSession();
  const { refetch: refetchCelo } = useCeloBalance();
  const [gasUi, setGasUi] = useState({
    address: undefined as string | undefined,
    phase: "idle" as GasEnsurePhase,
    message: null as string | null,
    lastResult: null as EnsureGasResult | null,
  });
  useEffect(() => {
    if (address === gasUi.address) return;
    setGasUi({
      address,
      phase: "idle",
      message: null,
      lastResult: null,
    });
  }, [address, gasUi.address]);

  const { phase, message, lastResult } = gasUi;
  const setPhase = (next: GasEnsurePhase) => setGasUi((s) => ({ ...s, phase: next }));
  const setMessage = (next: string | null) => setGasUi((s) => ({ ...s, message: next }));
  const setLastResult = (next: EnsureGasResult | null) =>
    setGasUi((s) => ({ ...s, lastResult: next }));

  const ensureGas = useCallback(
    async (options?: { knownBalance?: number }): Promise<EnsureGasResult> => {
      if (!address) {
        const fail = { ok: false as const, balance: 0, error: "Connect a wallet first." };
        setPhase("failed");
        setLastResult(fail);
        return fail;
      }

      const known = options?.knownBalance;
      if (known !== undefined && hasEnoughCeloForTx(known)) {
        const fast = {
          ok: true as const,
          balance: known,
          sponsored: false,
          borderline: isBorderlineCeloForTx(known),
        };
        setPhase("ready");
        setMessage(gasStatusMessage(fast));
        setLastResult(fast);
        return fast;
      }

      setPhase("checking");
      setMessage("Checking CELO on Celo for this wallet…");

      const before =
        known !== undefined ? known : await getCeloBalance(address as `0x${string}`);
      if (!hasEnoughCeloForTx(before)) {
        setPhase("sponsoring");
        setMessage(
          `Low gas (${formatCeloAmount(before)} CELO). Asking GoodDollar to fund ~${MIN_CELO_FOR_TX}+ CELO…`,
        );
      }

      const result = await ensureGoodDollarGasShared(address as `0x${string}`, {
        knownBalance: before,
      });

      if (result.ok) {
        setPhase("ready");
        setMessage(gasStatusMessage(result));
        await refetchCelo();
      } else {
        setPhase("failed");
        setMessage(result.error);
      }

      setLastResult(result);
      return result;
    },
    [address, refetchCelo],
  );

  const reset = useCallback(() => {
    setGasUi((s) => ({
      ...s,
      phase: "idle",
      message: null,
      lastResult: null,
    }));
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

/** Start GoodDollar gas sponsorship as soon as the panel opens — not on button click. */
export function useAutoEnsureGasWhenLow(active: boolean) {
  const { address, status } = useWalletSession();
  const { amount, low, loading: celoLoading } = useCeloBalance();
  const { ensureGas, phase, isEnsuring } = useEnsureGoodDollarGas();

  useEffect(() => {
    if (!active || status !== "ready" || !address || celoLoading || !low) return;
    if (isEnsuring || phase === "ready" || phase === "sponsoring") return;
    void ensureGas(amount !== undefined ? { knownBalance: amount } : undefined);
  }, [active, status, address, celoLoading, low, amount, isEnsuring, phase, ensureGas]);
}

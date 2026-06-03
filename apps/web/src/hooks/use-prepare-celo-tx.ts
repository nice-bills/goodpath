"use client";

import {
  formatCeloAmount,
  getCeloBalance,
  hasEnoughCeloForTx,
  MIN_CELO_FOR_TX,
} from "@/lib/gooddollar-gas";
import { useEnsureGoodDollarGas } from "@/hooks/use-ensure-gas";
import { useWalletSession } from "@/hooks/use-wallet-session";

/** Gas sponsorship + CELO balance check before a Celo contract tx. */
export function usePrepareCeloTx() {
  const { address, status } = useWalletSession();
  const { ensureGas, phase, message, isEnsuring } = useEnsureGoodDollarGas();

  const prepare = async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (status !== "ready" || !address) {
      return { ok: false, error: "Wallet not ready" };
    }
    const gas = await ensureGas();
    if (!gas.ok) {
      return {
        ok: false,
        error: gas.error || "Could not prepare gas. Wait ~60s and try again.",
      };
    }
    const liveCelo = await getCeloBalance(address);
    if (!hasEnoughCeloForTx(liveCelo)) {
      return {
        ok: false,
        error: `Need ~${MIN_CELO_FOR_TX}+ CELO on Celo (have ${formatCeloAmount(liveCelo)}).`,
      };
    }
    return { ok: true };
  };

  return { prepare, phase, message, isEnsuring, address, status };
}

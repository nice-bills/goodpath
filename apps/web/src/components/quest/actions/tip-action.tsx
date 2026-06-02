"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { SupportedChains, CHAIN_DECIMALS } from "@goodsdks/citizen-sdk";
import { ERC20_TRANSFER_ABI, gDollarAddress } from "@/lib/gd-contracts";
import { MIN_TIP_G, TIP_RECIPIENT } from "@/lib/env";
import {
  CELO_FAUCET_URL,
  getCeloBalance,
  hasEnoughCeloForTx,
  formatCeloAmount,
  MIN_CELO_FOR_TX,
} from "@/lib/gooddollar-gas";
import { useEnsureGoodDollarGas } from "@/hooks/use-ensure-gas";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import type { QuestStatus } from "@/lib/api";
import { formatTipError } from "@/lib/quest-errors";
import { GasSponsorBanner } from "@/components/gas-sponsor-banner";
import { QuestErrorAlert } from "../quest-error-alert";
import { QuestPanel } from "../quest-panel";

export function TipAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { address } = useAccount();
  const markComplete = useMarkQuestComplete();
  const { ensureGas, phase: gasPhase, message: gasMessage, isEnsuring } =
    useEnsureGoodDollarGas();
  const [tipError, setTipError] = useState<ReturnType<typeof formatTipError> | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const token = gDollarAddress();

  const { writeContract, isPending } = useWriteContract();

  const sendTip = async () => {
    if (!address) return;
    if (!token) {
      setTipError(formatTipError("G$ contract not configured for this environment"));
      return;
    }
    if (TIP_RECIPIENT === "0x0000000000000000000000000000000000000001") {
      setTipError(formatTipError("Set NEXT_PUBLIC_TIP_RECIPIENT to a real wallet before demo"));
      return;
    }
    setTipError(null);

    const gas = await ensureGas();
    if (!gas.ok) {
      setTipError(
        formatTipError(
          gas.error || "Could not prepare gas. Wait ~60s and try again.",
        ),
      );
      return;
    }

    const liveCelo = await getCeloBalance(address);
    if (!hasEnoughCeloForTx(liveCelo)) {
      setTipError(
        formatTipError(
          `Need ~${MIN_CELO_FOR_TX}+ CELO on Celo (have ${formatCeloAmount(liveCelo)}). MetaMask may block the tip.`,
        ),
      );
      return;
    }

    const decimals = CHAIN_DECIMALS[SupportedChains.CELO];
    const amount = parseUnits(MIN_TIP_G, decimals);
    writeContract(
      {
        address: token,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [TIP_RECIPIENT, amount],
      },
      {
        onSuccess: async (hash) => {
          setTxHash(hash);
          if (quest.completed) return;
          try {
            await markComplete(address, "tip", { txHash: hash });
            onUpdated();
          } catch (e) {
            setTipError(
              formatTipError(
                e instanceof Error ? e.message : "Server rejected tip proof",
              ),
            );
          }
        },
        onError: (e) => setTipError(formatTipError(e.message)),
      },
    );
  };

  const displayHash = txHash ?? quest.txHash;
  const busy = isPending || isEnsuring;

  if (quest.completed) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        {displayHash && (
          <a
            href={`https://celoscan.io/tx/${displayHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-xs text-accent underline"
          >
            View tip tx
          </a>
        )}
      </QuestPanel>
    );
  }

  if (!quest.unlocked) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-xs text-muted">Claim daily G$ first.</p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      <GasSponsorBanner phase={gasPhase} message={gasMessage} />
      <button
        type="button"
        onClick={sendTip}
        disabled={busy || !address}
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        {isEnsuring ? "Preparing gas…" : isPending ? "Sending…" : `Tip ${MIN_TIP_G} G$`}
      </button>
      {gasPhase === "failed" && (
        <a
          href={CELO_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-2 flex w-full items-center justify-center text-xs"
        >
          Celo faucet (fallback)
        </a>
      )}
      {displayHash && (
        <a
          href={`https://celoscan.io/tx/${displayHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-xs text-accent underline"
        >
          View transaction
        </a>
      )}
      {tipError && <QuestErrorAlert error={tipError} />}
    </QuestPanel>
  );
}

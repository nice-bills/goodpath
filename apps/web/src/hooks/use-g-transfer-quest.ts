"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { SupportedChains, CHAIN_DECIMALS } from "@goodsdks/citizen-sdk";
import { isConfiguredEthAddress, type QuestId } from "@goodpath/shared";
import { waitForCeloTxReceipt } from "@/lib/celo-public-client";
import { ERC20_TRANSFER_ABI, gDollarAddress } from "@/lib/gd-contracts";
import { usePrepareCeloTx } from "@/hooks/use-prepare-celo-tx";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { formatTipError } from "@/lib/quest-errors";

type TransferQuestId = Extract<QuestId, "tip" | "support">;

export function useGTransferQuest(options: {
  questId: TransferQuestId;
  recipient: `0x${string}`;
  minAmountG: string;
  notConfiguredMessage: string;
  completed?: boolean;
  onUpdated?: () => void;
}) {
  const { prepare, phase, message, isEnsuring, address, status } =
    usePrepareCeloTx();
  const markComplete = useMarkQuestComplete();
  const { writeContract, isPending } = useWriteContract();
  const [error, setError] = useState<ReturnType<typeof formatTipError> | null>(
    null,
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const token = gDollarAddress();

  const submitProof = async (hash: `0x${string}`) => {
    if (!address || options.completed) return;
    setConfirming(true);
    setError(null);
    try {
      const receipt = await waitForCeloTxReceipt(hash);
      if (receipt.status !== "success") {
        throw new Error("Transaction failed on Celo");
      }
      await markComplete(address, options.questId, { txHash: hash });
      options.onUpdated?.();
    } catch (e) {
      setError(
        formatTipError(
          e instanceof Error ? e.message : "Server rejected transfer proof",
        ),
      );
    } finally {
      setConfirming(false);
    }
  };

  const send = async () => {
    if (!address) return;
    if (!token) {
      setError(formatTipError("G$ contract not configured for this environment"));
      return;
    }
    if (!isConfiguredEthAddress(options.recipient)) {
      setError(formatTipError(options.notConfiguredMessage));
      return;
    }
    setError(null);

    const ready = await prepare();
    if (!ready.ok) {
      setError(formatTipError(ready.error));
      return;
    }

    const amount = parseUnits(
      options.minAmountG,
      CHAIN_DECIMALS[SupportedChains.CELO],
    );
    writeContract(
      {
        address: token,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [options.recipient, amount],
      },
      {
        onSuccess: async (hash) => {
          setTxHash(hash);
          await submitProof(hash);
        },
        onError: (e) => setError(formatTipError(e.message)),
      },
    );
  };

  const retryProof = async () => {
    if (!txHash) return;
    await submitProof(txHash as `0x${string}`);
  };

  return {
    send,
    retryProof,
    txHash,
    setTxHash,
    error,
    setError,
    busy: isPending || isEnsuring || confirming,
    confirming,
    gasPhase: phase,
    gasMessage: message,
    walletReady: status === "ready" && Boolean(address),
  };
}

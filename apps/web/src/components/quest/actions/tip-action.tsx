"use client";

import { CELO_FAUCET_URL } from "@/lib/gooddollar-gas";
import { useAutoEnsureGasWhenLow } from "@/hooks/use-ensure-gas";
import { MIN_TIP_G, TIP_RECIPIENT } from "@/lib/env";
import { useGTransferQuest } from "@/hooks/use-g-transfer-quest";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { QuestStatus } from "@/lib/api";
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
  const { status } = useWalletSession();
  const transfer = useGTransferQuest({
    questId: "tip",
    recipient: TIP_RECIPIENT,
    minAmountG: MIN_TIP_G,
    notConfiguredMessage:
      "Set NEXT_PUBLIC_TIP_RECIPIENT to a real wallet before demo",
    completed: quest.completed,
    onUpdated,
  });

  useAutoEnsureGasWhenLow(quest.unlocked && !quest.completed);

  const displayHash = transfer.txHash ?? quest.txHash;

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
        <p className="mt-3 text-xs text-muted">Verify your identity first.</p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      <GasSponsorBanner phase={transfer.gasPhase} message={transfer.gasMessage} />
      <button
        type="button"
        onClick={transfer.send}
        disabled={transfer.busy || status !== "ready" || !transfer.walletReady}
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        {transfer.busy && transfer.confirming
          ? "Confirming on Celo…"
          : transfer.busy && transfer.gasPhase !== "idle"
            ? "Preparing gas…"
            : transfer.busy
              ? "Sending…"
              : `Tip ${MIN_TIP_G} G$`}
      </button>
      {transfer.gasPhase === "failed" && (
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
      {transfer.error && displayHash && (
        <button
          type="button"
          onClick={() => void transfer.retryProof()}
          disabled={transfer.busy}
          className="btn-secondary mt-3 w-full text-xs disabled:opacity-50"
        >
          {transfer.confirming ? "Confirming on Celo…" : "Confirm tip (retry without sending)"}
        </button>
      )}
      {transfer.error && <QuestErrorAlert error={transfer.error} />}
    </QuestPanel>
  );
}

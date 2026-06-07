"use client";

import { useState } from "react";
import { SUPPORT_ACK_META, isConfiguredEthAddress } from "@goodpath/shared";
import { CELO_FAUCET_URL } from "@/lib/gooddollar-gas";
import { useAutoEnsureGasWhenLow } from "@/hooks/use-ensure-gas";
import { MIN_SUPPORT_G, SUPPORT_RECIPIENT } from "@/lib/env";
import { useGTransferQuest } from "@/hooks/use-g-transfer-quest";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { QuestStatus } from "@/lib/api";
import { formatTipError } from "@/lib/quest-errors";
import { GasSponsorBanner } from "@/components/gas-sponsor-banner";
import { ActionImpactFeedback } from "@/components/action-impact-feedback";
import { useProfile } from "@/hooks/use-profile";
import { QuestErrorAlert } from "../quest-error-alert";
import { QuestPanel } from "../quest-panel";

export function SupportAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { status, address } = useWalletSession();
  const { data: profile } = useProfile(address);
  const markComplete = useMarkQuestComplete();
  const [opened, setOpened] = useState(false);
  const [ackSubmitting, setAckSubmitting] = useState(false);
  const [ackError, setAckError] = useState<ReturnType<typeof formatTipError> | null>(
    null,
  );

  const transfer = useGTransferQuest({
    questId: "support",
    recipient: SUPPORT_RECIPIENT,
    minAmountG: MIN_SUPPORT_G,
    notConfiguredMessage:
      "Set NEXT_PUBLIC_SUPPORT_RECIPIENT to a GoodCollective pool address (or team wallet for demo)",
    completed: quest.completed,
    onUpdated,
  });

  useAutoEnsureGasWhenLow(quest.unlocked && !quest.completed);

  const openCollective = () => {
    window.open(
      quest.externalUrl ?? "https://goodcollective.vercel.app/",
      "_blank",
      "noopener,noreferrer",
    );
    setOpened(true);
  };

  const confirmVisit = async () => {
    if (!address) return;
    setAckSubmitting(true);
    setAckError(null);
    try {
      await markComplete(address, "support", { meta: SUPPORT_ACK_META });
      onUpdated();
    } catch (e) {
      setAckError(
        formatTipError(e instanceof Error ? e.message : "Could not complete quest"),
      );
    } finally {
      setAckSubmitting(false);
    }
  };

  const displayHash = transfer.txHash ?? quest.txHash;
  const walletReady = status === "ready" && Boolean(address);
  const recipientConfigured = isConfiguredEthAddress(SUPPORT_RECIPIENT);

  if (quest.completed) {
    const supportMeta = profile?.completions.support?.meta;
    return (
      <QuestPanel quest={quest} variant={variant}>
        {profile ? (
          <ActionImpactFeedback
            profile={profile}
            questId="support"
            meta={supportMeta}
            hasTx={Boolean(displayHash)}
          />
        ) : null}
        {displayHash ? (
          <a
            href={`https://celoscan.io/tx/${displayHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-xs text-accent underline"
          >
            View support tx on Celoscan
          </a>
        ) : (
          <p className="mt-3 text-sm font-medium text-win">Backed with G$</p>
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
      <p className="mt-2 text-xs text-muted">
        Preferred: send {MIN_SUPPORT_G} G$ on-chain (Celoscan proof). Or donate in
        GoodCollective and confirm below.
      </p>
      <GasSponsorBanner phase={transfer.gasPhase} message={transfer.gasMessage} />
      <button
        type="button"
        onClick={transfer.send}
        disabled={transfer.busy || !walletReady || !recipientConfigured}
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        {transfer.busy && transfer.confirming
          ? "Confirming on Celo…"
          : transfer.busy && transfer.gasPhase !== "idle"
            ? "Preparing gas…"
            : transfer.busy
              ? "Sending…"
              : `Back with ${MIN_SUPPORT_G} G$`}
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
      <button type="button" onClick={openCollective} className="btn-secondary mt-3 w-full">
        Open GoodCollective
      </button>
      {opened && (
        <button
          type="button"
          onClick={confirmVisit}
          disabled={ackSubmitting || !walletReady}
          className="btn-secondary mt-2 w-full text-xs disabled:opacity-50"
        >
          {ackSubmitting ? "Saving…" : "I donated elsewhere, complete with visit ack"}
        </button>
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
          {transfer.confirming ? "Confirming on Celo…" : "Confirm support (retry without sending)"}
        </button>
      )}
      {(transfer.error || ackError) && (
        <QuestErrorAlert error={transfer.error ?? ackError!} />
      )}
    </QuestPanel>
  );
}

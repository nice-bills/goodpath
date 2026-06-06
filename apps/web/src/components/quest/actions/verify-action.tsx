"use client";

import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useFvVerification } from "@/hooks/use-fv-verification";
import type { QuestStatus } from "@/lib/api";
import { QuestPanel } from "../quest-panel";
import { GoodWalletConnectHint } from "@/components/goodwallet-connect-hint";
import { FvVerificationOptions } from "../fv-verification-options";

export function VerifyAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { address } = useWalletSession();
  const markComplete = useMarkQuestComplete();

  const flow = useFvVerification({
    enabled: quest.unlocked && !quest.completed,
    onVerified: () => {
      if (!address) return;
      void markComplete(address, "verify").then(() => onUpdated());
    },
  });

  if (quest.completed) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-sm font-medium text-win">Verified on-chain</p>
      </QuestPanel>
    );
  }

  if (!quest.unlocked) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-xs text-muted">Connect your wallet first.</p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      {flow.whitelisted ? (
        <p className="mt-3 text-sm font-medium text-win">Verified, syncing…</p>
      ) : (
        <>
          <GoodWalletConnectHint className="mt-3" />
          <div className="mt-3">
            <FvVerificationOptions flow={flow} />
          </div>
        </>
      )}
    </QuestPanel>
  );
}

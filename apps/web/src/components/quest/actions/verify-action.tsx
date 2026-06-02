"use client";

import { useAccount } from "wagmi";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { useFvVerification } from "@/hooks/use-fv-verification";
import type { QuestStatus } from "@/lib/api";
import { QuestPanel } from "../quest-panel";
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
  const { address } = useAccount();
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
        <p className="mt-3 text-xs text-muted">Complete prior quests first.</p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      {flow.whitelisted ? (
        <p className="mt-3 text-sm font-medium text-win">Verified, syncing…</p>
      ) : (
        <FvVerificationOptions flow={flow} />
      )}
    </QuestPanel>
  );
}

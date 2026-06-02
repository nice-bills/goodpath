"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { SUPPORT_ACK_META } from "@goodpath/shared";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import type { QuestStatus } from "@/lib/api";
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
  const { address } = useAccount();
  const markComplete = useMarkQuestComplete();
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    setError(null);
    try {
      await markComplete(address, "support", { meta: SUPPORT_ACK_META });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete quest");
    } finally {
      setSubmitting(false);
    }
  };

  if (quest.completed) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-sm font-medium text-win">Community support recorded</p>
      </QuestPanel>
    );
  }

  if (!quest.unlocked) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-xs text-muted">Send a G$ tip first.</p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      <button type="button" onClick={openCollective} className="btn-secondary mt-4 w-full">
        Open GoodCollective
      </button>
      {opened && (
        <button
          type="button"
          onClick={confirmVisit}
          disabled={submitting}
          className="btn-primary mt-3 w-full"
        >
          {submitting ? "Saving…" : "I visited — complete quest"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-loss">{error}</p>}
    </QuestPanel>
  );
}

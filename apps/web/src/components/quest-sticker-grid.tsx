"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Coins,
  Fingerprint,
  Gift,
  HandHeart,
  Lock,
  Plant,
  Wallet,
} from "@phosphor-icons/react";
import type { QuestId } from "@goodpath/shared";
import type { QuestStatus } from "@/lib/api";
import { QuestAction } from "@/components/quest/quest-action";
import { QuestWhy } from "@/components/quest/quest-why";
import { QuestStateBadge, questVisualState } from "@/components/quest-state-badge";

const questIcons = {
  connect: Wallet,
  verify: Fingerprint,
  claim: Gift,
  tip: Coins,
  support: HandHeart,
  deploy: Plant,
} as const;

function questIdFromHash(hash: string): QuestId | null {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  const id = raw.startsWith("quest-") ? raw.slice("quest-".length) : raw;
  return id in questIcons ? (id as QuestId) : null;
}

export function QuestStickerGrid({
  quests,
  onUpdated,
}: {
  quests: QuestStatus[];
  onUpdated: () => void;
}) {
  const firstOpen = quests.find((q) => !q.completed && q.unlocked);
  const [selectedId, setSelectedId] = useState<QuestId | null>(null);

  const syncFromHash = useCallback(() => {
    const fromHash = questIdFromHash(window.location.hash);
    if (!fromHash) return;
    const quest = quests.find((q) => q.id === fromHash);
    if (quest?.unlocked && !quest.completed) {
      setSelectedId(fromHash);
    }
  }, [quests]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const focusedQuest =
    quests.find((q) => q.id === selectedId && q.unlocked && !q.completed) ??
    firstOpen ??
    null;

  const hasOpenQuests = quests.some((q) => !q.completed && q.unlocked);

  const selectQuest = (quest: QuestStatus) => {
    if (!quest.unlocked || quest.completed) return;
    setSelectedId(quest.id);
    const url = new URL(window.location.href);
    url.hash = `quest-${quest.id}`;
    window.history.replaceState(window.history.state, "", url.toString());
  };

  return (
    <section
      className={`quest-sticker-grid-wrap${hasOpenQuests ? " quest-sticker-grid-wrap-split" : ""}`}
    >
      <div className="quest-sticker-grid" aria-label="Path quests">
        {quests.map((quest, i) => {
          const selected = quest.id === focusedQuest?.id;
          const state = questVisualState(quest, { selected });
          const locked = state === "locked";
          const Icon = questIcons[quest.id];
          const wide = i === quests.length - 1;

          return (
            <article
              key={quest.id}
              id={`quest-${quest.id}`}
              role={locked ? undefined : "button"}
              tabIndex={locked ? undefined : 0}
              onClick={() => selectQuest(quest)}
              onKeyDown={(e) => {
                if (locked) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectQuest(quest);
                }
              }}
              className={`quest-grid-sticker quest-page-sticker quest-page-sticker-${i + 1} scroll-mt-24 ${
                wide ? "quest-grid-sticker-wide" : ""
              } ${selected ? "quest-page-sticker-active" : ""} ${locked ? "quest-sticker-locked" : "cursor-pointer"}`}
            >
              <div className="quest-grid-sticker-top">
                <div
                  className={`quest-sticker-icon ${state === "done" ? "is-done" : state === "active" ? "is-active" : state === "open" ? "is-open" : ""}`}
                >
                  {state === "done" ? (
                    <Check className="h-4 w-4" weight="bold" aria-hidden />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5" weight="bold" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" weight="bold" aria-hidden />
                  )}
                </div>
                <QuestStateBadge state={state} />
              </div>
              <p className="mt-2 font-semibold leading-snug">{quest.title}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
                {quest.rewardLabel}
              </p>
            </article>
          );
        })}
      </div>

      {focusedQuest && (
        <div className="quest-active-panel">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="section-label">Active step</p>
            <QuestStateBadge state="active" />
          </div>
          <article
            className={`card quest-page-sticker-active p-4 quest-page-sticker-${quests.findIndex((q) => q.id === focusedQuest.id) + 1}`}
          >
            <p className="font-semibold leading-snug">{focusedQuest.title}</p>
            <p className="mt-1.5 text-sm text-muted">{focusedQuest.description}</p>
            <QuestWhy text={focusedQuest.whyItMatters} />
            {focusedQuest.kind !== "auto" && (
              <div className="mt-4 border-t border-border pt-4">
                <QuestAction quest={focusedQuest} onUpdated={onUpdated} inline />
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

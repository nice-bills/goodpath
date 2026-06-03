"use client";

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
import type { QuestStatus } from "@/lib/api";
import { QuestAction } from "@/components/quest/quest-action";
import { QuestWhy } from "@/components/quest/quest-why";

const questIcons = {
  connect: Wallet,
  verify: Fingerprint,
  claim: Gift,
  tip: Coins,
  support: HandHeart,
  deploy: Plant,
} as const;

export function QuestStickerGrid({
  quests,
  onUpdated,
}: {
  quests: QuestStatus[];
  onUpdated: () => void;
}) {
  const nextQuest = quests.find((q) => !q.completed && q.unlocked);

  return (
    <section
      className={`quest-sticker-grid-wrap${nextQuest ? " quest-sticker-grid-wrap-split" : ""}`}
    >
      <div className="quest-sticker-grid" aria-label="Path quests">
        {quests.map((quest, i) => {
          const done = quest.completed;
          const locked = !quest.unlocked && !done;
          const active = quest.id === nextQuest?.id;
          const Icon = questIcons[quest.id];
          const wide = i === quests.length - 1;

          return (
            <article
              key={quest.id}
              id={quest.id}
              className={`quest-grid-sticker quest-page-sticker quest-page-sticker-${i + 1} scroll-mt-24 ${
                wide ? "quest-grid-sticker-wide" : ""
              } ${active ? "quest-page-sticker-active" : ""} ${locked ? "quest-sticker-locked opacity-60" : ""}`}
            >
              <div className="quest-grid-sticker-top">
                <div
                  className={`quest-sticker-icon ${done ? "is-done" : active ? "is-active" : ""}`}
                >
                  {done ? (
                    <Check className="h-4 w-4" weight="bold" aria-hidden />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5" weight="bold" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" weight="bold" aria-hidden />
                  )}
                </div>
                {done && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-win">
                    Done
                  </span>
                )}
              </div>
              <p className="mt-2 font-semibold leading-snug">{quest.title}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
                {quest.rewardLabel}
              </p>
            </article>
          );
        })}
      </div>

      {nextQuest && (
        <div className="quest-active-panel">
          <p className="section-label mb-2">Active step</p>
          <article className={`quest-page-sticker quest-page-sticker-active quest-page-sticker-${quests.findIndex((q) => q.id === nextQuest.id) + 1}`}>
            <p className="font-semibold leading-snug">{nextQuest.title}</p>
            <p className="mt-1.5 text-sm text-muted">{nextQuest.description}</p>
            <QuestWhy text={nextQuest.whyItMatters} />
            {nextQuest.kind !== "auto" && (
              <div className="mt-4 border-t border-border pt-4">
                <QuestAction quest={nextQuest} onUpdated={onUpdated} inline />
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

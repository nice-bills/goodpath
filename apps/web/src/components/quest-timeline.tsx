"use client";

import {
  Check,
  Coins,
  Fingerprint,
  Gift,
  HandHeart,
  Lock,
  Wallet,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { QuestStatus } from "@/lib/api";
import { QuestAction } from "@/components/quest/quest-action";
import { QuestWhy } from "@/components/quest/quest-why";
import { stagger } from "@/lib/motion";

const questIcons = {
  connect: Wallet,
  verify: Fingerprint,
  claim: Gift,
  tip: Coins,
  support: HandHeart,
} as const;

function TimelineNode({
  quest,
  index,
  active,
}: {
  quest: QuestStatus;
  index: number;
  active?: boolean;
}) {
  const done = quest.completed;
  const locked = !quest.unlocked && !done;

  if (done) {
    return (
      <div className="timeline-node bg-win-soft text-win">
        <Check className="h-4 w-4" weight="bold" />
      </div>
    );
  }
  if (locked) {
    return (
      <div className="timeline-node bg-surface-muted text-muted-dim">
        <Lock className="h-3.5 w-3.5" weight="bold" />
      </div>
    );
  }
  if (active) {
    return (
      <div className="timeline-node border-accent bg-accent text-white">
        <span className="font-mono">{index + 1}</span>
      </div>
    );
  }
  const Icon = questIcons[quest.id];
  return (
    <div className="timeline-node border-border-strong bg-surface text-muted">
      <Icon className="h-4 w-4" weight="bold" aria-hidden />
    </div>
  );
}

export function QuestTimeline({
  quests,
  progress,
  onUpdated,
}: {
  quests: QuestStatus[];
  progress: number;
  onUpdated: () => void;
}) {
  const fillPct = Math.min(100, Math.max(0, progress));
  const nextQuest = quests.find((q) => !q.completed && q.unlocked);

  return (
    <section className="relative">
      <div className="timeline-rail" aria-hidden>
        <div className="timeline-rail-fill" style={{ height: `${fillPct}%` }} />
      </div>

      <ol className="flex flex-col gap-5 pl-11">
        {quests.map((quest, i) => {
          const active = quest.id === nextQuest?.id;
          const showAction =
            quest.kind !== "auto" && !quest.completed && quest.unlocked && active;

          return (
            <motion.li
              key={quest.id}
              id={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={stagger(i)}
              className="relative scroll-mt-24"
            >
              <div className="absolute -left-11 top-1">
                <TimelineNode quest={quest} index={i} active={active} />
              </div>

              <article
                className={`quest-page-sticker quest-page-sticker-${i + 1} ${active ? "quest-page-sticker-active" : ""} ${!quest.unlocked && !quest.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-snug">{quest.title}</p>
                    <p className="mt-1.5 text-sm text-muted">{quest.description}</p>
                  </div>
                  {quest.completed && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-win">
                      Done
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
                  {quest.rewardLabel}
                </p>
                <QuestWhy text={quest.whyItMatters} />

                {showAction && (
                  <div className="mt-4 border-t border-border pt-4">
                    <QuestAction quest={quest} onUpdated={onUpdated} inline />
                  </div>
                )}
              </article>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

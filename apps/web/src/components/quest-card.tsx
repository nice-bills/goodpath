"use client";

import { TabLink } from "@/components/tab-link";
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
import { motion } from "framer-motion";
import type { QuestStatus } from "@/lib/api";
import { stagger } from "@/lib/motion";
import { QuestStateBadge, questVisualState } from "@/components/quest-state-badge";

const questIcons = {
  connect: Wallet,
  verify: Fingerprint,
  claim: Gift,
  tip: Coins,
  support: HandHeart,
  deploy: Plant,
} as const;

export function QuestCard({
  quest,
  index,
  active,
  compact,
}: {
  quest: QuestStatus;
  index: number;
  active?: boolean;
  compact?: boolean;
}) {
  const state = questVisualState(quest);
  const locked = state === "locked";
  const Icon = questIcons[quest.id];

  const inner = (
    <motion.div
      id={`quest-${quest.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={stagger(index)}
      className={`quest-sticker quest-sticker-${index + 1} ${active ? "quest-sticker-active" : ""} ${locked ? "quest-sticker-locked" : ""}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={`quest-sticker-icon ${state === "done" ? "is-done" : state === "active" ? "is-active" : ""}`}
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
      <div className="min-w-0 flex-1">
        <p className="mt-2 font-semibold leading-snug">{quest.title}</p>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{quest.description}</p>
        )}
        <p className="mt-1.5 text-[10px] font-semibold text-muted-dim">
          {quest.rewardLabel}
        </p>
      </div>
    </motion.div>
  );

  if (locked) return inner;

  return (
    <TabLink tab="quests" hash={`quest-${quest.id}`} className="block">
      {inner}
    </TabLink>
  );
}

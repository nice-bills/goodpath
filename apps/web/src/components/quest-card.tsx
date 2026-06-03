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
  const done = quest.completed;
  const locked = !quest.unlocked && !done;
  const Icon = questIcons[quest.id];

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={stagger(index)}
      className={`quest-sticker quest-sticker-${index + 1} ${active ? "quest-sticker-active" : ""} ${locked ? "quest-sticker-locked" : ""}`}
    >
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
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{quest.title}</p>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{quest.description}</p>
        )}
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          {quest.rewardLabel}
        </p>
      </div>
    </motion.div>
  );

  if (locked) return inner;

  return (
    <TabLink tab="quests" hash={quest.id} className="block">
      {inner}
    </TabLink>
  );
}

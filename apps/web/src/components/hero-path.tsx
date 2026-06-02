"use client";

import { motion } from "framer-motion";
import { StreakBadge } from "@/components/streak-badge";
import { PathHub } from "@/components/path-hub";
import type { QuestStatus } from "@/lib/api";

export function HeroPath({
  progress,
  streak,
  headline,
  subline,
  quests,
}: {
  progress: number;
  streak: number;
  headline: string;
  subline: React.ReactNode;
  quests?: QuestStatus[];
}) {
  const earned = Math.round(progress / 20);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="passport-hero mb-8"
    >
      <div className="passport-paper">
        <div className="passport-head">
          <div>
            <span>Week 1</span>
            <strong>My G$ passport</strong>
          </div>
          <StreakBadge streak={streak} />
        </div>

        {quests && quests.length > 0 ? <PathHub quests={quests} /> : null}

        <div className="passport-grid mt-4" aria-label={`${earned} of 5 path stickers earned`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`passport-stamp passport-stamp-${index + 1} ${
                index < earned ? "is-earned" : "is-empty"
              }`}
            >
              <span>{index < earned ? "Earned" : "Locked"}</span>
              <strong>{index + 1}</strong>
            </div>
          ))}
        </div>

        <div className="passport-footer">
          <div>
            <p className="font-display text-2xl leading-tight">{headline}</p>
            <p className="mt-1 text-sm text-muted">{subline}</p>
          </div>
          <div className="passport-progress">
            <strong>{progress}%</strong>
            <span>complete</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

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
      className="passport-hero home-passport-hero"
      aria-labelledby="home-passport-title"
    >
      <div className="passport-paper home-passport-paper">
        <div className="passport-head home-passport-head">
          <div>
            <span className="section-label">Week 1</span>
            <h2 id="home-passport-title" className="home-passport-title">
              My G$ passport
            </h2>
            <p className="home-passport-meta">
              <span className="font-mono tabular-nums">{earned}</span> of 5 stickers ·{" "}
              <span className="font-mono tabular-nums">{progress}%</span> complete
            </p>
          </div>
          <StreakBadge streak={streak} />
        </div>

        {quests && quests.length > 0 ? <PathHub quests={quests} className="home-path-hub" /> : null}

        <div
          className="passport-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${earned} of 5 path stickers earned`}
        >
          <div className="passport-track-rail">
            <div className="passport-track-fill" style={{ width: `${progress}%` }} />
          </div>
          <ol className="passport-track-steps">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className={
                  index < earned
                    ? "passport-track-step is-earned"
                    : "passport-track-step is-pending"
                }
                aria-label={`Sticker ${index + 1}, ${index < earned ? "earned" : "locked"}`}
              >
                <span className="passport-track-dot" aria-hidden />
              </li>
            ))}
          </ol>
        </div>

        <div className="passport-footer home-passport-footer">
          <div className="home-passport-footer-copy">
            <p className="home-passport-footer-headline">{headline}</p>
            <p className="home-passport-footer-sub">{subline}</p>
          </div>
          <div className="home-passport-progress-pill" aria-hidden>
            <strong className="font-mono tabular-nums">{progress}%</strong>
            <span>done</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

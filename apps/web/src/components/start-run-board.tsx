"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Lightning, Wallet } from "@phosphor-icons/react";
import { ConnectButton } from "@/components/connect-button";
import { TabLink } from "@/components/tab-link";
import { RunPulseFeed } from "@/components/vibe/run-pulse-feed";
import { RunsHeatingUp } from "@/components/vibe/runs-heating-up";

const ease = [0.32, 0.72, 0, 1] as const;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

export function StartRunBoard() {
  return (
    <motion.section
      className="vibe-landing-board"
      aria-labelledby="vibe-landing-cta-title"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={rise}>
        <RunPulseFeed />
      </motion.div>

      <motion.div variants={rise}>
        <RunsHeatingUp />
      </motion.div>

      <motion.div className="vibe-connect-shell" variants={rise}>
        <div className="vibe-connect-card">
          <div className="vibe-connect-head">
            <div className="vibe-connect-mark" aria-hidden>
              <Lightning className="h-6 w-6" weight="fill" />
            </div>
            <p className="vibe-connect-eyebrow">Your move</p>
          </div>
          <h2 id="vibe-landing-cta-title" className="vibe-connect-title">
            Get on the board before the streak passes you
          </h2>
          <p className="vibe-connect-sub">
            Real quest proofs on Celo: claim, tip, support, save, or stream. Your wallet
            shows up on the live board.
          </p>
          <div className="vibe-connect-cta">
            <div className="vibe-hero-connect group">
              <ConnectButton variant="pill" />
              <span className="vibe-hero-connect-arrow" aria-hidden>
                <ArrowUpRight className="h-4 w-4" weight="bold" />
              </span>
            </div>
            <span className="vibe-connect-hint">
              <Wallet className="inline h-3.5 w-3.5" weight="duotone" aria-hidden /> Google
              · email · MetaMask
            </span>
          </div>
        </div>
      </motion.div>

      <p className="vibe-explore-nudge">
        Want to see who&apos;s moving?{" "}
        <TabLink tab="explore" className="vibe-link-all">
          Open Explore
        </TabLink>
      </p>

      <motion.ul className="vibe-perk-row" aria-label="Run perks" variants={rise}>
        <li className="vibe-perk-sticker vibe-perk-sticker-a">Claim daily G$</li>
        <li className="vibe-perk-sticker vibe-perk-sticker-b">Tip &amp; pools</li>
        <li className="vibe-perk-sticker vibe-perk-sticker-c">Save + stream</li>
        <li className="vibe-perk-sticker vibe-perk-sticker-d">Weekly flex</li>
      </motion.ul>
    </motion.section>
  );
}

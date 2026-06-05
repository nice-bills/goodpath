"use client";

import { motion } from "framer-motion";
import { Lightning, Wallet } from "@phosphor-icons/react";
import { ConnectButton } from "@/components/connect-button";
import { RunPulseFeed } from "@/components/vibe/run-pulse-feed";
import { RunsHeatingUp } from "@/components/vibe/runs-heating-up";

const ease = [0.32, 0.72, 0, 1] as const;

export function StartRunBoard() {
  return (
    <motion.section
      className="vibe-landing-board"
      aria-labelledby="vibe-landing-cta-title"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      <RunPulseFeed />

      <RunsHeatingUp />

      <div className="vibe-connect-card">
        <div className="vibe-connect-mark" aria-hidden>
          <Lightning className="h-6 w-6" weight="fill" />
        </div>
        <p className="vibe-connect-eyebrow">Week 1 · live on Celo</p>
        <h2 id="vibe-landing-cta-title" className="vibe-connect-title">
          Get on the board before the streak passes you
        </h2>
        <p className="vibe-connect-sub">
          Real quest proofs on Celo — claim, tip, support, save, or Superfluid stream.
          Your wallet shows up on the live board.
        </p>
        <div className="vibe-connect-cta">
          <ConnectButton variant="pill" />
          <span className="vibe-connect-hint">
            <Wallet className="inline h-3.5 w-3.5" weight="duotone" aria-hidden /> Google
            · email · MetaMask
          </span>
        </div>
      </div>

      <ul className="vibe-perk-row" aria-label="What you unlock">
        <li>Claim daily G$</li>
        <li>Tip &amp; pools</li>
        <li>Save + stream</li>
        <li>Weekly flex</li>
      </ul>
    </motion.section>
  );
}

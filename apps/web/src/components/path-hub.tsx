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
import type { QuestStatus } from "@/lib/api";

const nodes = [
  { id: "connect", icon: Wallet, label: "Wallet" },
  { id: "verify", icon: Fingerprint, label: "Verify" },
  { id: "claim", icon: Gift, label: "Claim" },
  { id: "tip", icon: Coins, label: "Tip" },
  { id: "support", icon: HandHeart, label: "Support" },
] as const;

export function PathHub({
  quests,
  className,
}: {
  quests: QuestStatus[];
  className?: string;
}) {
  const byId = new Map(quests.map((q) => [q.id, q]));

  return (
    <div
      className={["path-hub", className].filter(Boolean).join(" ")}
      aria-label="Path steps"
    >
      {nodes.map(({ id, icon: Icon, label }, index) => {
        const quest = byId.get(id);
        const done = quest?.completed;
        const locked = quest && !quest.unlocked && !done;
        const active = quest && quest.unlocked && !done;

        return (
          <div key={id} className="path-hub-node-wrap">
            {index > 0 && <span className="path-hub-connector" aria-hidden />}
            <div
              className={`path-hub-node ${done ? "is-done" : active ? "is-active" : locked ? "is-locked" : ""}`}
              title={quest?.title ?? label}
            >
              {done ? (
                <Check className="h-4 w-4" weight="bold" aria-hidden />
              ) : locked ? (
                <Lock className="h-3.5 w-3.5" weight="bold" aria-hidden />
              ) : (
                <Icon className="h-4 w-4" weight="bold" aria-hidden />
              )}
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

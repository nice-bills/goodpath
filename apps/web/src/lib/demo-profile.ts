import type { ProfileResponse } from "@/lib/api";
import { QUESTS } from "@goodpath/shared";

const DEMO_ADDRESS = "0xDemo000000000000000000000000000000000001";

/** Seeded profile for judge/demo mode — no chain required. */
export function buildDemoProfile(): ProfileResponse {
  const now = new Date().toISOString();
  const completions: ProfileResponse["completions"] = {
    connect: { completedAt: now, txHash: null },
    verify: { completedAt: now, txHash: null },
    claim: {
      completedAt: now,
      txHash: "0x0000000000000000000000000000000000000000000000000000000000000001",
    },
    tip: {
      completedAt: now,
      txHash: "0x0000000000000000000000000000000000000000000000000000000000000002",
    },
    support: {
      completedAt: now,
      txHash: "0x0000000000000000000000000000000000000000000000000000000000000003",
    },
  };

  return {
    address: DEMO_ADDRESS,
    streak: 3,
    lastActiveDate: now.slice(0, 10),
    pathCompletedAt: now,
    progress: 100,
    chainProofs: [
      { questId: "tip", txHash: completions.tip!.txHash! },
      { questId: "support", txHash: completions.support!.txHash! },
    ],
    personalBests: {
      fastestPathSeconds: 252,
      longestStreak: 7,
      claimsThisWeek: 5,
    },
    league: {
      periodId: "2026-W22",
      points: 86,
      rank: 4,
      totalInLeague: 18,
      promoted: false,
      streakShield: true,
      division: "gold",
      divisionLabel: "Gold",
      divisionRank: 2,
      divisionSize: 8,
      gMovedWei: "184200000000000000000",
      nextMove: "Deploy G$: save or stream on Celo mainnet.",
    },
    referredBy: null,
    referralsCompletedThisWeek: 1,
    completions,
    quests: QUESTS.map((q) => {
      const done = q.id !== "deploy";
      return {
        ...q,
        completed: done,
        completedAt: done ? (completions[q.id]?.completedAt ?? now) : null,
        txHash: completions[q.id]?.txHash ?? null,
        unlocked: done || q.id === "deploy",
      };
    }),
  };
}

export const DEMO_MODE_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "1";

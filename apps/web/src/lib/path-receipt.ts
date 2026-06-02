import { QUESTS } from "@goodpath/shared";
import type { ProfileResponse } from "@/lib/api";

const EXPLORER_TX = (hash: string) => `https://celoscan.io/tx/${hash}`;

export function formatPathReceipt(profile: ProfileResponse): string {
  const lines = [
    "G$ PATH — COMPLETION RECEIPT",
    "────────────────────────────",
    `Wallet: ${profile.address.slice(0, 6)}…${profile.address.slice(-4)}`,
    `Streak: ${profile.streak} day${profile.streak === 1 ? "" : "s"}`,
    profile.pathCompletedAt
      ? `Completed: ${new Date(profile.pathCompletedAt).toLocaleDateString()}`
      : `Progress: ${profile.progress}%`,
    "",
    "QUESTS",
  ];

  const questById = new Map(profile.quests.map((q) => [q.id, q]));
  for (const q of QUESTS) {
    const row = questById.get(q.id);
    const done = row?.completed ? "✓" : "○";
    let detail = row?.completed ? "done" : "pending";
    if (row?.txHash) {
      detail = EXPLORER_TX(row.txHash);
    }
    lines.push(`${done} ${q.title}: ${detail}`);
  }

  lines.push("", "Built on GoodDollar · Celo · UBI for all.");
  return lines.join("\n");
}

export function receiptShareLine(profile: ProfileResponse): string {
  const rank =
    profile.league?.rank != null
      ? ` #${profile.league.rank} this week in Path League.`
      : "";
  const time = profile.personalBests?.fastestPathSeconds
    ? ` Path time: ${Math.floor(profile.personalBests.fastestPathSeconds / 60)}m.`
    : "";
  return `I completed my G$ Path — verified, claimed UBI, tipped, supported GoodCollective.${time}${rank} ${profile.streak}-day streak. #GoodDollar #UBI`;
}

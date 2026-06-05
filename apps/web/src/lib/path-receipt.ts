import { QUESTS } from "@goodpath/shared";
import type { ProfileResponse, QuestStatus } from "@/lib/api";
import { formatGsMoved } from "@/lib/format";

const EXPLORER_TX = (hash: string) => `https://celoscan.io/tx/${hash}`;

export function formatPathReceipt(profile: ProfileResponse): string {
  const lines = [
    "G$ PATH COMPLETION RECEIPT",
    "────────────────────────────",
    `Wallet: ${profile.address.slice(0, 6)}…${profile.address.slice(-4)}`,
    `Streak: ${profile.streak} day${profile.streak === 1 ? "" : "s"}`,
    profile.pathCompletedAt
      ? `Completed: ${new Date(profile.pathCompletedAt).toLocaleDateString()}`
      : `Progress: ${profile.progress}%`,
    "",
    "QUESTS",
  ];

  const questById = new Map(profile.quests.map((q: QuestStatus) => [q.id, q]));
  for (const q of QUESTS) {
    const row = questById.get(q.id);
    const done = row?.completed ? "✓" : "○";
    let detail = row?.completed ? "done" : "pending";
    if (row?.txHash) {
      detail = EXPLORER_TX(row.txHash);
    }
    lines.push(`${done} ${q.title}: ${detail}`);
  }

  if (profile.league?.nextMove) {
    lines.push("", `NEXT MOVE: ${profile.league.nextMove}`);
  }
  if (profile.publicCard?.proofMix?.length) {
    lines.push(`PROOF MIX: ${profile.publicCard.proofMix.join(", ")}`);
  }
  lines.push("", "Built on GoodDollar · Celo · UBI for all.");
  return lines.join("\n");
}

export function receiptShareLine(profile: ProfileResponse): string {
  const promoted =
    profile.league?.promoted
      ? ` Promoted in ${profile.league.divisionLabel ?? "division"},`
      : "";
  const rank =
    profile.league?.rank != null
      ? ` #${profile.league.rank} this week in Path League.`
      : "";
  const time = profile.personalBests?.fastestPathSeconds
    ? ` Path time: ${Math.floor(profile.personalBests.fastestPathSeconds / 60)}m.`
    : "";
  const deployMeta = profile.completions.deploy?.txHash;
  const deployNote = deployMeta ? " + deployed G$ (save/stream)," : "";
  const proofCount = profile.chainProofs?.length ?? 0;
  const proofNote =
    proofCount > 0 ? ` ${proofCount} Celoscan proof${proofCount === 1 ? "" : "s"},` : "";
  const gMoved = formatGsMoved(profile.league?.gMovedWei);
  const div = profile.league?.divisionLabel;
  const divNote = div ? ` ${div} division,` : "";
  return `I ran G$ on Celo: ${gMoved} G$ moved this week,${divNote}${promoted} verified + claimed + tipped + supported${deployNote}${proofNote} on-chain.${time}${rank} ${profile.streak}-day streak. #GoodDollar #Celo`;
}

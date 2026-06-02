export type QuestId =
  | "connect"
  | "verify"
  | "claim"
  | "tip"
  | "support";

export type QuestKind = "auto" | "identity" | "claim" | "transfer" | "external";

export interface QuestDefinition {
  id: QuestId;
  order: number;
  title: string;
  description: string;
  /** One-line GoodDollar education (quest tooltip). */
  whyItMatters: string;
  kind: QuestKind;
  rewardLabel: string;
  /** Min G$ for transfer quests (human units) */
  minAmount?: string;
  externalUrl?: string;
}

export const QUESTS: QuestDefinition[] = [
  {
    id: "connect",
    order: 1,
    title: "Connect your wallet",
    description: "Link a wallet on Celo to start your G$ path.",
    whyItMatters: "GoodDollar runs on Celo — your wallet is how you receive UBI and send G$.",
    kind: "auto",
    rewardLabel: "Path unlocked",
  },
  {
    id: "verify",
    order: 2,
    title: "Verify your identity",
    description: "Complete GoodDollar face verification so you're sybil-resistant.",
    whyItMatters: "One person, one identity — so UBI goes to real humans, not duplicate bots.",
    kind: "identity",
    rewardLabel: "+1 step",
  },
  {
    id: "claim",
    order: 3,
    title: "Claim daily G$",
    description: "Claim your universal basic income — come back every day.",
    whyItMatters: "Daily G$ from the UBI pool — claimable every day once you're verified.",
    kind: "claim",
    rewardLabel: "Daily UBI",
  },
  {
    id: "tip",
    order: 4,
    title: "Send a G$ tip",
    description: "Tip a friend or the demo jar with real G$ on Celo.",
    whyItMatters: "G$ is real money on-chain — tipping proves you can transact, not just claim.",
    kind: "transfer",
    rewardLabel: "Utility unlocked",
    minAmount: "0.01",
  },
  {
    id: "support",
    order: 5,
    title: "Support the community",
    description: "Open GoodCollective and support a pool — or mark done after visiting.",
    whyItMatters: "GoodCollective pools fund builders and causes — onboarding ends in participation.",
    kind: "external",
    rewardLabel: "Community badge",
    externalUrl: "https://goodcollective.vercel.app/",
  },
];

export const QUEST_IDS = QUESTS.map((q) => q.id);

/** Client must send this meta to complete the support quest after visiting GoodCollective. */
export const SUPPORT_ACK_META = "goodcollective_visit_ack" as const;

export function questById(id: QuestId): QuestDefinition {
  const q = QUESTS.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown quest: ${id}`);
  return q;
}

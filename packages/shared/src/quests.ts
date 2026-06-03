export type QuestId =
  | "connect"
  | "verify"
  | "claim"
  | "tip"
  | "support"
  | "deploy";

export type QuestKind =
  | "auto"
  | "identity"
  | "claim"
  | "transfer"
  | "external"
  | "deploy";

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
  /** Post-path only — unlocked after core path is complete */
  postPath?: boolean;
}

export const QUESTS: QuestDefinition[] = [
  {
    id: "connect",
    order: 1,
    title: "Connect your wallet",
    description: "Link a wallet on Celo to start your G$ path.",
    whyItMatters:
      "GoodDollar runs on Celo — your wallet is how you receive UBI and send G$.",
    kind: "auto",
    rewardLabel: "Path unlocked",
  },
  {
    id: "verify",
    order: 2,
    title: "Verify your identity",
    description:
      "Complete GoodDollar face verification so you're sybil-resistant.",
    whyItMatters:
      "One person, one identity — so UBI goes to real humans, not duplicate bots.",
    kind: "identity",
    rewardLabel: "+1 step",
  },
  {
    id: "claim",
    order: 3,
    title: "Claim daily G$",
    description: "Claim your universal basic income — come back every day.",
    whyItMatters:
      "Daily G$ from the UBI pool — claimable every day once you're verified.",
    kind: "claim",
    rewardLabel: "Daily UBI",
  },
  {
    id: "tip",
    order: 4,
    title: "Send a G$ tip",
    description: "Tip a friend or the demo jar with real G$ on Celo.",
    whyItMatters:
      "G$ is real money on-chain — tipping proves you can transact, not just claim.",
    kind: "transfer",
    rewardLabel: "Utility unlocked",
    minAmount: "0.01",
  },
  {
    id: "support",
    order: 5,
    title: "Support the community",
    description:
      "Send G$ to a GoodCollective pool (on-chain), or visit and confirm if you donated elsewhere.",
    whyItMatters:
      "GoodCollective pools fund builders and causes — onboarding ends in participation.",
    kind: "external",
    rewardLabel: "Community badge",
    externalUrl: "https://goodcollective.vercel.app/",
    minAmount: "0.01",
  },
  {
    id: "deploy",
    order: 6,
    title: "Put your G$ to work",
    description:
      "Save: stake G$ via savings-sdk. Stream: micro-flow G$/mo with Superfluid on Celo.",
    whyItMatters:
      "Idle G$ should grow or flow — official GoodDollar save + stream paths, provable on Celoscan.",
    kind: "deploy",
    rewardLabel: "Grow unlocked",
    minAmount: "0.01",
    postPath: true,
  },
];

/** Quests that count toward 100% path completion (excludes post-path deploy). */
export const CORE_PATH_QUEST_IDS: QuestId[] = QUESTS.filter((q) => !q.postPath).map(
  (q) => q.id,
);

export const QUEST_IDS = QUESTS.map((q) => q.id);

/** Client must send this meta to complete the support quest after visiting GoodCollective. */
export const SUPPORT_ACK_META = "goodcollective_visit_ack" as const;

/** Server accepts deploy completion when user staked via savings-sdk. */
export const DEPLOY_SAVE_META = "deploy_save" as const;

/** Server accepts deploy completion when user opened a Superfluid G$ stream. */
export const DEPLOY_STREAM_META = "deploy_stream" as const;

/** Quest ids whose completion can include an on-chain tx hash for league proof. */
export const CHAIN_PROOF_QUEST_IDS = ["tip", "support", "deploy"] as const;

export function questById(id: QuestId): QuestDefinition {
  const q = QUESTS.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown quest: ${id}`);
  return q;
}

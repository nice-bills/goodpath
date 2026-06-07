import {
  currentClaimPeriodDate,
  isClaimedForPeriod,
  isSameClaimPeriod,
} from "./claim-period.js";
import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  SUPPORT_ACK_META,
  type QuestId,
} from "./quests.js";
import { leaguePointsForQuest } from "./league-points.js";

export type GDollarUseId = "tip" | "support" | "save" | "stream" | "flex";

export type ProofIdentityTitle =
  | "Daily Claimer"
  | "Tipper"
  | "Backer"
  | "Saver"
  | "Streamer";

export interface GDollarUsePath {
  id: GDollarUseId;
  questId?: QuestId;
  label: string;
  subtitle: string;
  /** Quest deep-link hash on the Claim tab. */
  hash?: string;
  /** App tab when not a quest action (e.g. Flex). */
  tab?: "celebrate";
  /** Stream is the highest-status daily move. */
  premium?: boolean;
  deployMeta?: typeof DEPLOY_SAVE_META | typeof DEPLOY_STREAM_META;
}

export const G_DOLLAR_USE_PATHS: GDollarUsePath[] = [
  {
    id: "tip",
    questId: "tip",
    label: "Spend today's G$",
    subtitle: "Tip on Celo — real money moved",
    hash: "quest-tip",
  },
  {
    id: "support",
    questId: "support",
    label: "Back something",
    subtitle: "Support a GoodCollective pool",
    hash: "quest-support",
  },
  {
    id: "save",
    questId: "deploy",
    label: "Save your G$",
    subtitle: "Stake via savings-sdk",
    hash: "quest-deploy",
    deployMeta: DEPLOY_SAVE_META,
  },
  {
    id: "stream",
    questId: "deploy",
    label: "Stream G$",
    subtitle: "Money moving every second",
    hash: "quest-deploy",
    premium: true,
    deployMeta: DEPLOY_STREAM_META,
  },
  {
    id: "flex",
    label: "Flex your run",
    subtitle: "Share receipt, rank, and proofs",
    tab: "celebrate",
  },
];

export interface DailyRunInput {
  lastActiveDate: string | null;
  streak: number;
  quests: {
    id: QuestId;
    completed: boolean;
    unlocked: boolean;
    completedAt?: string | null;
  }[];
  completions: Record<
    string,
    {
      completedAt: string;
      txHash?: string | null;
      meta?: string | null;
      gAmountWei?: string;
    }
  >;
  league?: {
    points: number;
    divisionLabel?: string;
    personAbove?: { label: string; points: number; gap: number } | null;
    gMovedWei?: string;
  };
  /** Claim period id YYYY-MM-DD; defaults to current GoodDollar window. */
  today?: string;
}

export interface DailyRunState {
  claimedToday: boolean;
  streakAlive: boolean;
  streakAtRisk: boolean;
  usedGToday: boolean;
  bestNextUse: GDollarUseId | null;
  bestNextUseLabel: string | null;
  tomorrowHook: string;
  identityTitles: ProofIdentityTitle[];
  primaryIdentity: ProofIdentityTitle | null;
  receiptStrength: number;
  runCompleteToday: boolean;
  /** Wei from today's claim tx when recorded. */
  fuelWei: string | null;
  rivalGap: { label: string; gap: number } | null;
}

export function isDailyClaimDue(input: DailyRunInput): boolean {
  const claimQuest = input.quests.find((q) => q.id === "claim");
  if (!claimQuest?.unlocked) return false;
  const period = input.today ?? currentClaimPeriodDate();
  return !isClaimedForPeriod(input.lastActiveDate, period);
}

export function deriveIdentityTitles(
  completions: DailyRunInput["completions"],
): ProofIdentityTitle[] {
  const titles: ProofIdentityTitle[] = [];
  if (completions.claim) titles.push("Daily Claimer");
  if (completions.tip) titles.push("Tipper");
  if (completions.support) titles.push("Backer");
  const deployMeta = completions.deploy?.meta;
  if (deployMeta === DEPLOY_SAVE_META) titles.push("Saver");
  if (deployMeta === DEPLOY_STREAM_META) titles.push("Streamer");
  return titles;
}

export function primaryIdentityTitle(
  titles: ProofIdentityTitle[],
): ProofIdentityTitle | null {
  const priority: ProofIdentityTitle[] = [
    "Streamer",
    "Saver",
    "Backer",
    "Tipper",
    "Daily Claimer",
  ];
  for (const title of priority) {
    if (titles.includes(title)) return title;
  }
  return null;
}

export function receiptStrengthScore(input: {
  completions: DailyRunInput["completions"];
  streak: number;
}): number {
  let score = 0;
  if (input.completions.claim) score += 1;
  if (input.completions.tip) score += 1;
  if (input.completions.support) score += 1;
  if (input.completions.deploy) score += 1;
  if (input.streak >= 3) score += 1;
  return Math.min(5, score);
}

/** Recommend the highest-value unlocked G$ move not yet done. */
export function bestNextGUse(
  quests: DailyRunInput["quests"],
  completions: DailyRunInput["completions"],
): GDollarUseId | null {
  const claimDone = quests.find((q) => q.id === "claim")?.completed;
  if (!claimDone) return null;

  const deployMeta = completions.deploy?.meta;
  const deployDone = quests.find((q) => q.id === "deploy")?.completed;

  const order: GDollarUseId[] = ["stream", "support", "tip", "save"];
  for (const useId of order) {
    const path = G_DOLLAR_USE_PATHS.find((p) => p.id === useId)!;
    if (!path.questId) continue;
    const quest = quests.find((q) => q.id === path.questId);
    if (!quest?.unlocked) continue;

    if (path.questId === "deploy") {
      if (!deployDone) return useId;
      if (useId === "stream" && deployMeta !== DEPLOY_STREAM_META) return useId;
      if (useId === "save" && deployMeta !== DEPLOY_SAVE_META && deployMeta !== DEPLOY_STREAM_META)
        return useId;
      continue;
    }

    if (!quest.completed) return useId;
  }
  return null;
}

function buildTomorrowHook(input: {
  claimedToday: boolean;
  usedGToday: boolean;
  streak: number;
  streakAtRisk: boolean;
  league?: DailyRunInput["league"];
  runCompleteToday: boolean;
}): string {
  if (input.runCompleteToday) {
    return "Come back tomorrow to claim again and stack another proof on your receipt.";
  }
  if (input.streakAtRisk) {
    return "Claim tomorrow or your streak cools off.";
  }
  if (input.claimedToday && !input.usedGToday) {
    return "Tomorrow's claim is waiting — put today's G$ to work first.";
  }
  if (!input.claimedToday && input.streak > 0) {
    return "Keep your streak alive — claim again tomorrow.";
  }
  const rival = input.league?.personAbove;
  if (rival && rival.gap <= 5) {
    return `${rival.label} is ${rival.gap} pt${rival.gap === 1 ? "" : "s"} ahead. Close the gap this week.`;
  }
  return "Come back tomorrow to claim again and keep your run moving.";
}

export function deriveDailyRun(input: DailyRunInput): DailyRunState {
  const period = input.today ?? currentClaimPeriodDate();
  const claimedToday = isClaimedForPeriod(input.lastActiveDate, period);

  const usedGToday =
    (input.completions.tip &&
      isSameClaimPeriod(input.completions.tip.completedAt, period)) ||
    (input.completions.support &&
      isSameClaimPeriod(input.completions.support.completedAt, period)) ||
    (input.completions.deploy &&
      isSameClaimPeriod(input.completions.deploy.completedAt, period));

  const claimRow = input.completions.claim;
  const fuelWei =
    claimedToday && claimRow?.gAmountWei && claimRow.gAmountWei !== "0"
      ? claimRow.gAmountWei
      : null;

  const rival = input.league?.personAbove;
  const rivalGap =
    rival && rival.gap > 0 ? { label: rival.label, gap: rival.gap } : null;

  const bestNextUse = bestNextGUse(input.quests, input.completions);
  const bestPath = bestNextUse
    ? G_DOLLAR_USE_PATHS.find((p) => p.id === bestNextUse)
    : null;

  const identityTitles = deriveIdentityTitles(input.completions);
  const streakAlive = input.streak > 0;
  const streakAtRisk = streakAlive && !claimedToday;
  const runCompleteToday = claimedToday && usedGToday;

  return {
    claimedToday,
    streakAlive,
    streakAtRisk,
    usedGToday,
    bestNextUse,
    bestNextUseLabel: bestPath?.label ?? null,
    tomorrowHook: buildTomorrowHook({
      claimedToday,
      usedGToday,
      streak: input.streak,
      streakAtRisk,
      league: input.league,
      runCompleteToday,
    }),
    identityTitles,
    primaryIdentity: primaryIdentityTitle(identityTitles),
    receiptStrength: receiptStrengthScore({
      completions: input.completions,
      streak: input.streak,
    }),
    runCompleteToday,
    fuelWei,
    rivalGap,
  };
}

export interface ActionImpactInput {
  questId: QuestId;
  meta?: string | null;
  hasTx?: boolean;
  streak: number;
  league?: {
    points: number;
    personAbove?: { label: string; points: number; gap: number } | null;
    gMovedWei?: string;
  };
  receiptStrength: number;
}

export interface ActionImpactSummary {
  pointsGained: number;
  streakLabel: string;
  rivalGap: { label: string; gap: number } | null;
  receiptStrength: number;
  headline: string;
}

export function summarizeActionImpact(input: ActionImpactInput): ActionImpactSummary {
  const pointsGained = leaguePointsForQuest(
    input.questId,
    input.meta,
    input.hasTx,
  );

  const streakLabel =
    input.streak <= 1
      ? "Streak started"
      : `${input.streak}-day streak saved`;

  const rival = input.league?.personAbove;
  const rivalGap =
    rival && rival.gap > 0 ? { label: rival.label, gap: rival.gap } : null;

  const headlines: Partial<Record<QuestId, string>> = {
    claim: "Today's G$ is in your wallet.",
    tip: "You moved real G$ on Celo.",
    support:
      input.meta === SUPPORT_ACK_META && !input.hasTx
        ? "You backed something — impact logged."
        : "You backed something with G$.",
    deploy:
      input.meta === DEPLOY_STREAM_META
        ? "Your G$ is streaming every second."
        : "Your G$ is saved and working.",
  };

  return {
    pointsGained,
    streakLabel,
    rivalGap,
    receiptStrength: input.receiptStrength,
    headline: headlines[input.questId] ?? "Run updated.",
  };
}

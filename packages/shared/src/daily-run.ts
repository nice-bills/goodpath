import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  type QuestId,
} from "./quests.js";
import { leaguePointsForQuest } from "./league-points.js";

export type GDollarUseId = "tip" | "support" | "save" | "stream";

export type ProofIdentityTitle =
  | "Daily Claimer"
  | "Tipper"
  | "Backer"
  | "Saver"
  | "Streamer";

export interface GDollarUsePath {
  id: GDollarUseId;
  questId: QuestId;
  label: string;
  subtitle: string;
  hash: string;
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
    { completedAt: string; txHash?: string | null; meta?: string | null }
  >;
  league?: {
    points: number;
    divisionLabel?: string;
    personAbove?: { label: string; points: number; gap: number } | null;
    gMovedWei?: string;
  };
  /** ISO date YYYY-MM-DD; defaults to UTC today. */
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
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOnDate(completedAt: string, date: string): boolean {
  return completedAt.slice(0, 10) === date;
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
  const today = input.today ?? todayUtc();
  const claimRow = input.completions.claim;
  const claimedToday = claimRow
    ? isOnDate(claimRow.completedAt, today)
    : input.lastActiveDate === today;

  const usedGToday =
    (input.completions.tip && isOnDate(input.completions.tip.completedAt, today)) ||
    (input.completions.support &&
      isOnDate(input.completions.support.completedAt, today)) ||
    (input.completions.deploy &&
      isOnDate(input.completions.deploy.completedAt, today));

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
    support: "You backed something with G$.",
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

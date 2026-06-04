import type { QuestId } from "./quests.js";

export type LeagueDivision = "bronze" | "silver" | "gold";

const DIVISION_LABEL: Record<LeagueDivision, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export function divisionForPoints(points: number): LeagueDivision {
  if (points >= 80) return "gold";
  if (points >= 40) return "silver";
  return "bronze";
}

export function divisionLabel(division: LeagueDivision): string {
  return DIVISION_LABEL[division];
}

/** Seeded weekly median per division for solo “beat the pack” challenge. */
export const DIVISION_MEDIAN_SCORE: Record<LeagueDivision, number> = {
  bronze: 24,
  silver: 52,
  gold: 88,
};

export function beatMedianChallenge(
  points: number,
  division: LeagueDivision,
): { median: number; ahead: boolean; pointsToMedian: number } {
  const median = DIVISION_MEDIAN_SCORE[division];
  return {
    median,
    ahead: points >= median,
    pointsToMedian: Math.max(0, median - points),
  };
}

/** Seeded division of 8 so early apps still feel competitive (GoodPath 2.0). */
export function seededDivisionRank(points: number): {
  division: LeagueDivision;
  rank: number;
  divisionSize: number;
} {
  const division = divisionForPoints(points);
  const seedScores = [8, 18, 32, 48, 64, 82, 96];
  const better = seedScores.filter((s) => s > points).length;
  return {
    division,
    rank: better + 1,
    divisionSize: 8,
  };
}

export function nextMoveHint(input: {
  points: number;
  quests: { id: QuestId; completed: boolean; unlocked: boolean }[];
  hasStreamProof: boolean;
  hasSaveProof: boolean;
}): string {
  const next = input.quests.find((q) => q.unlocked && !q.completed);
  if (!next) {
    if (!input.hasStreamProof && !input.hasSaveProof) {
      return "Open a G$ stream or savings position for +12 pts and a Celoscan proof.";
    }
    return "Beat your weekly score — tip, support, or claim again tomorrow.";
  }
  switch (next.id) {
    case "verify":
      return "Verify on Celo — unlock claim and league points.";
    case "claim":
      return "Claim daily G$ — entry to the run, not the finish line.";
    case "tip":
      return "Tip with G$ on Celo — moves real G$ and adds league pts.";
    case "support":
      return "Support a GoodCollective pool — deep G$ circulation proof.";
    case "deploy":
      return "Deploy G$: save or stream on Celo mainnet.";
    default:
      return "Continue your run on the quests tab.";
  }
}

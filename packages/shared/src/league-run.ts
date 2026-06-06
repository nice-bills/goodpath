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

/** Demo-safe seeded runner in a division cohort (not a real user). */
export interface SeededCompetitor {
  /** Display label — always marked as benchmark */
  label: string;
  points: number;
  isSeeded: true;
  /** Stable id for UI keys */
  id: string;
}

/** Eight benchmark runners per division; ranks interleave with the real user. */
export const SEEDED_DIVISION_COHORT: Record<LeagueDivision, SeededCompetitor[]> = {
  bronze: [
    { id: "seed-b1", label: "Benchmark · Mara", points: 8, isSeeded: true },
    { id: "seed-b2", label: "Benchmark · Jo", points: 18, isSeeded: true },
    { id: "seed-b3", label: "Benchmark · Lin", points: 28, isSeeded: true },
    { id: "seed-b4", label: "Benchmark · Sam", points: 36, isSeeded: true },
    { id: "seed-b5", label: "Benchmark · Rey", points: 44, isSeeded: true },
    { id: "seed-b6", label: "Benchmark · Paz", points: 52, isSeeded: true },
    { id: "seed-b7", label: "Benchmark · Uma", points: 60, isSeeded: true },
  ],
  silver: [
    { id: "seed-s1", label: "Benchmark · Kai", points: 42, isSeeded: true },
    { id: "seed-s2", label: "Benchmark · Noa", points: 54, isSeeded: true },
    { id: "seed-s3", label: "Benchmark · Eli", points: 62, isSeeded: true },
    { id: "seed-s4", label: "Benchmark · Rio", points: 70, isSeeded: true },
    { id: "seed-s5", label: "Benchmark · Zee", points: 78, isSeeded: true },
    { id: "seed-s6", label: "Benchmark · Ash", points: 86, isSeeded: true },
    { id: "seed-s7", label: "Benchmark · Sol", points: 94, isSeeded: true },
  ],
  gold: [
    { id: "seed-g1", label: "Benchmark · Vega", points: 82, isSeeded: true },
    { id: "seed-g2", label: "Benchmark · Orion", points: 90, isSeeded: true },
    { id: "seed-g3", label: "Benchmark · Lyra", points: 98, isSeeded: true },
    { id: "seed-g4", label: "Benchmark · Nova", points: 106, isSeeded: true },
    { id: "seed-g5", label: "Benchmark · Aria", points: 114, isSeeded: true },
    { id: "seed-g6", label: "Benchmark · Flux", points: 122, isSeeded: true },
    { id: "seed-g7", label: "Benchmark · Echo", points: 130, isSeeded: true },
  ],
};

export function seededDivisionRank(points: number): {
  division: LeagueDivision;
  rank: number;
  divisionSize: number;
} {
  const division = divisionForPoints(points);
  const cohort = SEEDED_DIVISION_COHORT[division];
  const better = cohort.filter((c) => c.points > points).length;
  return {
    division,
    rank: better + 1,
    divisionSize: cohort.length + 1,
  };
}

export function buildDivisionLeaderboard(
  userPoints: number,
  division: LeagueDivision,
  userLabel = "You",
): Array<{ label: string; points: number; isSeeded: boolean; isUser: boolean }> {
  const cohort = SEEDED_DIVISION_COHORT[division];
  const rows = [
    ...cohort.map((c) => ({
      label: c.label,
      points: c.points,
      isSeeded: true as const,
      isUser: false,
    })),
    { label: userLabel, points: userPoints, isSeeded: false, isUser: true },
  ];
  rows.sort((a, b) => b.points - a.points || (a.isUser ? -1 : 1));
  return rows;
}

export function personAboveInDivision(
  userPoints: number,
  division: LeagueDivision,
): { label: string; points: number; gap: number } | null {
  const board = buildDivisionLeaderboard(userPoints, division);
  const userIdx = board.findIndex((r) => r.isUser);
  if (userIdx <= 0) return null;
  const above = board[userIdx - 1]!;
  return {
    label: above.label,
    points: above.points,
    gap: above.points - userPoints + 1,
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
      return "Open a G$ stream (+18 pts) or savings deploy (+12 pts) with Celoscan proof.";
    }
    if (!input.hasStreamProof) {
      return "Try a Superfluid G$ stream for +18 league pts vs save.";
    }
    return "Beat your weekly score: tip, support on-chain, or claim again tomorrow.";
  }
  switch (next.id) {
    case "verify":
      return "Verify on Celo to unlock the rest of your path.";
    case "claim":
      return "Claim daily G$. Entry to the run, not the finish line.";
    case "tip":
      return "Tip with G$ on Celo. Moves real G$ and adds league pts.";
    case "support":
      return "Support a GoodCollective pool on-chain for +10 pts (vs visit ack).";
    case "deploy":
      return "Deploy G$: save (+12) or stream (+18) on Celo mainnet.";
    default:
      return "Continue your run on the quests tab.";
  }
}

/** Default seeded rival label for solo demo. */
export const DEFAULT_SEEDED_RIVAL_LABEL = "Benchmark · Rival";

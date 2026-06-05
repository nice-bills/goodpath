import {
  DEFAULT_SEEDED_RIVAL_LABEL,
  divisionForPoints,
  divisionLabel,
  buildDivisionLeaderboard,
  personAboveInDivision,
  seededDivisionRank,
  nextMoveHint,
  leaguePointsForQuest,
  type LeagueDivision,
  type QuestId,
} from "@goodpath/shared";
import { getRepositories } from "../repository/provider.js";
import { SEEDED_RIVAL_ADDRESSES, ensureSeededDivisionEntries } from "./seeded.js";

export function getPeriodId(date = new Date()): string {
  return getRepositories().league.getPeriodId(date);
}

export function getWeekStartUtc(date = new Date()): string {
  return getRepositories().league.getWeekStartUtc(date);
}

export function countReferralsCompletedThisWeek(referrerLower: string): number {
  return getRepositories().referral.countReferralsCompletedThisWeek(referrerLower);
}

export function computeWeeklyPoints(
  address: string,
  streak: number,
  pathCompletedAt: string | null,
  completions: Record<
    string,
    { completedAt: string; txHash: string | null; meta: string | null }
  >,
): number {
  const { league, referral } = getRepositories();
  const weekStart = league.getWeekStartUtc();
  const lower = address.toLowerCase();

  let points = 0;
  for (const [questId, row] of Object.entries(completions)) {
    const completedAt = row.completedAt.slice(0, 10);
    if (completedAt < weekStart) continue;
    points += leaguePointsForQuest(
      questId as QuestId,
      row.meta,
      Boolean(row.txHash),
    );
  }

  points += Math.min(streak, 14) * 5;

  if (pathCompletedAt && pathCompletedAt.slice(0, 10) >= weekStart) {
    points += 50;
  }

  points += referral.referralBonusPoints(lower, weekStart);
  return points;
}

export function getLeagueStanding(
  address: string,
  streak: number,
  pathCompletedAt: string | null,
  completions: Record<
    string,
    { completedAt: string; txHash: string | null; meta: string | null }
  >,
) {
  const { league } = getRepositories();
  const lower = address.toLowerCase();
  const weekStart = league.getWeekStartUtc();
  const periodId = league.getPeriodId();
  const myPoints = computeWeeklyPoints(
    lower,
    streak,
    pathCompletedAt,
    completions,
  );

  const addresses = league.listActiveAddresses(weekStart);
  const { profile } = getRepositories();
  const active = addresses
    .map((addr) => {
      const row = league.getProfileStreakAndPath(addr);
      const comp = profile.getCompletions(addr);
      return {
        address: addr,
        points: computeWeeklyPoints(
          addr,
          row.streak,
          row.path_completed_at,
          comp,
        ),
      };
    })
    .filter((s) => s.points > 0);

  active.sort((a, b) => b.points - a.points || a.address.localeCompare(b.address));

  const rankIndex = active.findIndex((s) => s.address === lower);
  const totalInLeague = active.length;
  const displayRank = rankIndex >= 0 ? rankIndex + 1 : null;
  const hasTipThisWeek = league.hasTipThisWeek(lower, weekStart);

  const division = divisionForPoints(myPoints);
  const seasonId = league.ensureSeason(periodId, weekStart);
  league.upsertUserDivisionEntry(seasonId, lower, division, myPoints);
  ensureSeededDivisionEntries(seasonId, division);

  const divisionBoard = seededDivisionRank(myPoints);
  const leaderboard = buildDivisionLeaderboard(myPoints, division);
  const above = personAboveInDivision(myPoints, division);

  const rivalSlot = SEEDED_RIVAL_ADDRESSES[lower.length % SEEDED_RIVAL_ADDRESSES.length]!;
  getRepositories().social.ensureSeededRival(
    lower,
    rivalSlot,
    DEFAULT_SEEDED_RIVAL_LABEL,
  );
  const rival = getRepositories().social.getRival(lower);

  return {
    periodId,
    points: myPoints,
    rank: myPoints > 0 ? displayRank : null,
    totalInLeague: Math.max(totalInLeague, 1),
    promoted: displayRank != null && displayRank <= 3,
    streakShield:
      (displayRank != null && displayRank <= 5) || hasTipThisWeek,
    division,
    divisionLabel: divisionLabel(division),
    divisionRank: divisionBoard.rank,
    divisionSize: divisionBoard.divisionSize,
    divisionLeaderboard: leaderboard.slice(0, 6),
    personAbove: above,
    rival: rival
      ? {
          address: rival.rival_address,
          label: rival.rival_label,
          isSeeded: Boolean(rival.is_seeded),
        }
      : null,
  };
}

export function buildLeaguePayload(
  address: string,
  streak: number,
  pathCompletedAt: string | null,
  completions: Record<
    string,
    { completedAt: string; txHash: string | null; meta: string | null }
  >,
  quests: { id: QuestId; completed: boolean; unlocked: boolean }[],
  deployMeta: string | null | undefined,
  gMovedWei: string,
) {
  const standing = getLeagueStanding(
    address,
    streak,
    pathCompletedAt,
    completions,
  );

  return {
    ...standing,
    gMovedWei,
    nextMove: nextMoveHint({
      points: standing.points,
      quests,
      hasStreamProof: deployMeta === "deploy_stream",
      hasSaveProof: deployMeta === "deploy_save",
    }),
  };
}

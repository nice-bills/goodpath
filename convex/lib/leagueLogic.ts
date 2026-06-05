import {
  DEFAULT_SEEDED_RIVAL_LABEL,
  divisionForPoints,
  divisionLabel,
  buildDivisionLeaderboard,
  personAboveInDivision,
  seededDivisionRank,
  leaguePointsForQuest,
  REFERRAL_PATH_BONUS,
  type QuestId,
} from "@goodpath/shared";
import type { GenericQueryCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

type DbCtx = GenericQueryCtx<DataModel>;
import { normalizeAddress } from "./dates";
import { countReferralsCompletedThisWeek } from "./referrals";

export const SEEDED_RIVAL_ADDRESSES = [
  "0xseed000000000000000000000000000000000001",
  "0xseed000000000000000000000000000000000002",
  "0xseed000000000000000000000000000000000003",
] as const;

export type CompletionRecord = {
  completedAt: string;
  txHash: string | null;
  meta: string | null;
  gAmountWei?: string;
};

export async function loadCompletions(
  ctx: DbCtx,
  address: string,
): Promise<Record<string, CompletionRecord>> {
  const rows = await ctx.db
    .query("questCompletions")
    .withIndex("by_address", (q) => q.eq("address", address))
    .collect();

  const out: Record<string, CompletionRecord> = {};
  for (const r of rows) {
    out[r.questId] = {
      completedAt: r.completedAt,
      txHash: r.txHash ?? null,
      meta: r.meta ?? null,
      gAmountWei: r.gAmountWei,
    };
  }
  return out;
}

export function computeWeeklyPoints(
  streak: number,
  pathCompletedAt: string | null | undefined,
  completions: Record<string, CompletionRecord>,
  referralBonus: number,
  weekStart: string,
): number {
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
  points += referralBonus;
  return points;
}

async function countReferralBonus(
  ctx: DbCtx,
  referrerLower: string,
  weekStart: string,
): Promise<number> {
  const count = await countReferralsCompletedThisWeek(
    ctx,
    referrerLower,
    weekStart,
  );
  return count * REFERRAL_PATH_BONUS;
}

export type SeasonContext = {
  weekStart: string;
  periodId: string;
};

/** Read-only league standing for profile queries (no DB writes). */
export async function buildLeagueStanding(
  ctx: DbCtx,
  address: string,
  streak: number,
  pathCompletedAt: string | null | undefined,
  completions: Record<string, CompletionRecord>,
  season: SeasonContext,
) {
  const lower = normalizeAddress(address);
  const { weekStart, periodId } = season;
  const referralBonus = await countReferralBonus(ctx, lower, weekStart);
  const myPoints = computeWeeklyPoints(
    streak,
    pathCompletedAt ?? null,
    completions,
    referralBonus,
    weekStart,
  );

  const active = await loadWeeklyActiveStandings(
    ctx,
    lower,
    periodId,
    myPoints,
  );

  active.sort((a, b) => b.points - a.points || a.address.localeCompare(b.address));
  const rankIndex = active.findIndex((s) => s.address === lower);
  const totalInLeague = active.length;
  const displayRank = rankIndex >= 0 ? rankIndex + 1 : null;

  const hasTipThisWeek = Object.entries(completions).some(
    ([id, row]) =>
      id === "tip" && row.completedAt.slice(0, 10) >= weekStart,
  );

  const division = divisionForPoints(myPoints);
  const divisionBoard = seededDivisionRank(myPoints);
  const leaderboard = buildDivisionLeaderboard(myPoints, division);
  const above = personAboveInDivision(myPoints, division);

  const rivalRow = await ctx.db
    .query("rivalLinks")
    .withIndex("by_user", (q) => q.eq("userAddress", lower))
    .first();

  const rivalSlot =
    SEEDED_RIVAL_ADDRESSES[lower.length % SEEDED_RIVAL_ADDRESSES.length]!;
  const rival = rivalRow
    ? {
        address: rivalRow.rivalAddress,
        label: rivalRow.rivalLabel ?? null,
        isSeeded: rivalRow.isSeeded,
      }
    : {
        address: rivalSlot,
        label: DEFAULT_SEEDED_RIVAL_LABEL,
        isSeeded: true,
      };

  return {
    periodId,
    points: myPoints,
    rank: myPoints > 0 ? displayRank : null,
    totalInLeague: Math.max(totalInLeague, 1),
    promoted: displayRank != null && displayRank <= 3,
    streakShield: (displayRank != null && displayRank <= 5) || hasTipThisWeek,
    division,
    divisionLabel: divisionLabel(division),
    divisionRank: divisionBoard.rank,
    divisionSize: divisionBoard.divisionSize,
    divisionLeaderboard: leaderboard.slice(0, 6),
    personAbove: above,
    rival,
  };
}

export function defaultSeededRivalAddress(userAddress: string): string {
  return SEEDED_RIVAL_ADDRESSES[
    userAddress.length % SEEDED_RIVAL_ADDRESSES.length
  ]!;
}

/** Global weekly rank from indexed division rows (avoids full-table scans in queries). */
async function loadWeeklyActiveStandings(
  ctx: DbCtx,
  viewerLower: string,
  periodId: string,
  viewerPoints: number,
): Promise<{ address: string; points: number }[]> {
  const season = await ctx.db
    .query("seasons")
    .withIndex("by_period", (q) => q.eq("periodId", periodId))
    .first();

  if (!season) {
    return viewerPoints > 0
      ? [{ address: viewerLower, points: viewerPoints }]
      : [];
  }

  const entries = await ctx.db
    .query("divisionEntries")
    .withIndex("by_season", (q) => q.eq("seasonId", season._id))
    .collect();

  const active: { address: string; points: number }[] = [];
  for (const row of entries) {
    if (row.isSeeded || row.points <= 0) continue;
    active.push({ address: row.address, points: row.points });
  }

  const viewerRow = active.find((r) => r.address === viewerLower);
  if (viewerPoints > 0) {
    if (viewerRow) {
      viewerRow.points = viewerPoints;
    } else {
      active.push({ address: viewerLower, points: viewerPoints });
    }
  }

  return active;
}

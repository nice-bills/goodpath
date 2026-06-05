import {
  DEFAULT_SEEDED_RIVAL_LABEL,
  SEEDED_DIVISION_COHORT,
  divisionForPoints,
  REFERRAL_PATH_BONUS,
  type LeagueDivision,
} from "@goodpath/shared";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getPeriodId, getWeekStartUtc, normalizeAddress } from "./dates";
import {
  SEEDED_RIVAL_ADDRESSES,
  computeWeeklyPoints,
  loadCompletions,
} from "./leagueLogic";
import { countReferralsCompletedThisWeek } from "./referrals";

/** Deterministic pseudo-address for seeded cohort rows (Convex has no Node `Buffer`). */
function seededIdToAddress(id: string): string {
  const bytes = new TextEncoder().encode(id);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return `0x${hex.padEnd(40, "0").slice(0, 40)}`.toLowerCase();
}

export async function ensureSeason(
  ctx: MutationCtx,
  periodId: string,
  weekStart: string,
): Promise<Id<"seasons">> {
  const existing = await ctx.db
    .query("seasons")
    .withIndex("by_period", (q) => q.eq("periodId", periodId))
    .first();
  if (existing) return existing._id;

  const ends = new Date(`${weekStart}T00:00:00Z`);
  ends.setUTCDate(ends.getUTCDate() + 7);
  return await ctx.db.insert("seasons", {
    periodId,
    startsAt: weekStart,
    endsAt: ends.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  });
}

export async function ensureSeededDivisionEntries(
  ctx: MutationCtx,
  seasonId: Id<"seasons">,
  division: LeagueDivision,
): Promise<void> {
  const cohort = SEEDED_DIVISION_COHORT[division];
  const now = new Date().toISOString();
  for (const c of cohort) {
    const addr = seededIdToAddress(c.id);
    const existing = await ctx.db
      .query("divisionEntries")
      .withIndex("by_season_address", (q) =>
        q.eq("seasonId", seasonId).eq("address", addr),
      )
      .first();
    if (existing) {
      await ctx.db.patch("divisionEntries", existing._id, {
        division,
        points: c.points,
        isSeeded: true,
        label: c.label,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("divisionEntries", {
        seasonId,
        address: addr,
        division,
        points: c.points,
        isSeeded: true,
        label: c.label,
        updatedAt: now,
      });
    }
  }
}

export async function syncLeagueAfterQuest(
  ctx: MutationCtx,
  address: string,
): Promise<void> {
  const lower = normalizeAddress(address);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .first();
  if (!profile) return;

  const completions = await loadCompletions(ctx, lower);
  const weekStart = getWeekStartUtc();
  const periodId = getPeriodId();

  const referralCount = await countReferralsCompletedThisWeek(
    ctx,
    lower,
    weekStart,
  );
  const myPoints = computeWeeklyPoints(
    profile.streak,
    profile.pathCompletedAt,
    completions,
    referralCount * REFERRAL_PATH_BONUS,
    weekStart,
  );

  const division = divisionForPoints(myPoints);
  const seasonId = await ensureSeason(ctx, periodId, weekStart);

  const now = new Date().toISOString();
  const existing = await ctx.db
    .query("divisionEntries")
    .withIndex("by_season_address", (q) =>
      q.eq("seasonId", seasonId).eq("address", lower),
    )
    .first();
  if (existing) {
    await ctx.db.patch("divisionEntries", existing._id, {
      division,
      points: myPoints,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("divisionEntries", {
      seasonId,
      address: lower,
      division,
      points: myPoints,
      isSeeded: false,
      updatedAt: now,
    });
  }

  await ensureSeededDivisionEntries(ctx, seasonId, division);

  const rivalSlot =
    SEEDED_RIVAL_ADDRESSES[lower.length % SEEDED_RIVAL_ADDRESSES.length]!;
  const rivalExisting = await ctx.db
    .query("rivalLinks")
    .withIndex("by_user", (q) => q.eq("userAddress", lower))
    .first();
  if (!rivalExisting || rivalExisting.isSeeded) {
    if (rivalExisting) {
      await ctx.db.patch("rivalLinks", rivalExisting._id, {
        rivalAddress: rivalSlot,
        rivalLabel: DEFAULT_SEEDED_RIVAL_LABEL,
        isSeeded: true,
      });
    } else {
      await ctx.db.insert("rivalLinks", {
        userAddress: lower,
        rivalAddress: rivalSlot,
        rivalLabel: DEFAULT_SEEDED_RIVAL_LABEL,
        isSeeded: true,
        createdAt: now,
      });
    }
  }

}

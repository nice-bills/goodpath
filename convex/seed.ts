import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { SEEDED_DIVISION_COHORT, type LeagueDivision } from "@goodpath/shared";
import { ensureSeason, ensureSeededDivisionEntries } from "./lib/leagueWrites";
import { getPeriodId, getWeekStartUtc } from "./lib/dates";

/** Dev/admin: seed division benchmark runners for the current season. */
export const divisionRunners = internalMutation({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    seasonId: v.id("seasons"),
    periodId: v.string(),
    cohortCounts: v.record(v.string(), v.number()),
  }),
  handler: async (ctx) => {
    const periodId = getPeriodId();
    const weekStart = getWeekStartUtc();
    const seasonId = await ensureSeason(ctx, periodId, weekStart);

    const divisions: LeagueDivision[] = ["bronze", "silver", "gold"];
    for (const division of divisions) {
      await ensureSeededDivisionEntries(ctx, seasonId, division);
    }

    return {
      ok: true as const,
      seasonId,
      periodId,
      cohortCounts: Object.fromEntries(
        divisions.map((d) => [d, SEEDED_DIVISION_COHORT[d].length]),
      ),
    };
  },
});

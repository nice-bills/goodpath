import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

type DbCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

/** Referrals who finished the path this UTC week (indexed by referrer). */
export async function countReferralsCompletedThisWeek(
  ctx: DbCtx,
  referrerLower: string,
  weekStart: string,
): Promise<number> {
  const referred = await ctx.db
    .query("profiles")
    .withIndex("by_referredBy", (q) => q.eq("referredBy", referrerLower))
    .collect();
  return referred.filter(
    (p) =>
      p.pathCompletedAt != null &&
      p.pathCompletedAt.slice(0, 10) >= weekStart,
  ).length;
}

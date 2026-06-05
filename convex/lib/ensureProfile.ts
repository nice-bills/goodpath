import type { MutationCtx } from "../_generated/server";
import { normalizeAddress } from "./dates";

export async function ensureProfile(ctx: MutationCtx, address: string) {
  const lower = normalizeAddress(address);
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .first();

  const now = new Date().toISOString();
  if (existing) {
    await ensureConnectQuest(ctx, lower);
    return existing;
  }

  await ctx.db.insert("profiles", {
    address: lower,
    streak: 0,
    longestStreak: 0,
    createdAt: now,
    pathStartedAt: now,
  });

  const created = await ctx.db
    .query("profiles")
    .withIndex("by_address", (q) => q.eq("address", lower))
    .first();
  if (!created) throw new Error("Failed to create profile");
  await ensureConnectQuest(ctx, lower);
  return created;
}

async function ensureConnectQuest(ctx: MutationCtx, lower: string) {
  const connect = await ctx.db
    .query("questCompletions")
    .withIndex("by_address_quest", (q) =>
      q.eq("address", lower).eq("questId", "connect"),
    )
    .first();
  if (!connect) {
    await ctx.db.insert("questCompletions", {
      address: lower,
      questId: "connect",
      completedAt: new Date().toISOString(),
    });
  }
}

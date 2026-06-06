import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { parseWalletAddress } from "./lib/address";
import { benchmarkHandle, seededLabelByAddress } from "./lib/seeded";

const MAX_TITLE = 80;
const MIN_TITLE = 3;

const publicRun = v.object({
  id: v.string(),
  handle: v.string(),
  title: v.string(),
  periodId: v.string(),
  createdAt: v.string(),
});

const myRun = v.union(
  v.null(),
  v.object({
    id: v.string(),
    title: v.string(),
    periodId: v.string(),
    isPublic: v.boolean(),
    createdAt: v.string(),
  }),
);

function shortAddress(address: string): string {
  const a = address.toLowerCase();
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function normalizeTitle(raw: string): string {
  const title = raw.trim().replace(/\s+/g, " ");
  if (title.length < MIN_TITLE) {
    throw new Error(`Goal must be at least ${MIN_TITLE} characters`);
  }
  if (title.length > MAX_TITLE) {
    throw new Error(`Goal must be ${MAX_TITLE} characters or less`);
  }
  return title;
}

export const createRun = mutation({
  args: {
    address: v.string(),
    title: v.string(),
    /** ISO week id from client — keeps mutation cache-friendly. */
    periodId: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.literal(true),
    id: v.string(),
    title: v.string(),
    periodId: v.string(),
    isPublic: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const address = parseWalletAddress(args.address);
    const title = normalizeTitle(args.title);
    const periodId = args.periodId.trim();
    if (!periodId) {
      throw new Error("Invalid week");
    }
    const isPublic = args.isPublic ?? true;
    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("weeklyGoals")
      .withIndex("by_address_period", (q) =>
        q.eq("address", address).eq("periodId", periodId),
      )
      .first();

    if (existing) {
      await ctx.db.patch("weeklyGoals", existing._id, {
        title,
        isPublic,
        updatedAt: now,
      });
      return {
        ok: true as const,
        id: existing._id,
        title,
        periodId,
        isPublic,
      };
    }

    const id = await ctx.db.insert("weeklyGoals", {
      address,
      title,
      periodId,
      isPublic,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true as const,
      id,
      title,
      periodId,
      isPublic,
    };
  },
});

export const getMyRun = query({
  args: {
    address: v.string(),
    periodId: v.string(),
  },
  returns: myRun,
  handler: async (ctx, args) => {
    const address = parseWalletAddress(args.address);
    const row = await ctx.db
      .query("weeklyGoals")
      .withIndex("by_address_period", (q) =>
        q.eq("address", address).eq("periodId", args.periodId),
      )
      .first();

    if (!row) return null;

    return {
      id: row._id,
      title: row.title,
      periodId: row.periodId,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
    };
  },
});

export const listRecentPublicRuns = query({
  args: {
    limit: v.optional(v.number()),
    periodId: v.string(),
  },
  returns: v.object({
    runs: v.array(publicRun),
    periodId: v.string(),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 16);
    const periodId = args.periodId;

    const rows = await ctx.db
      .query("weeklyGoals")
      .withIndex("by_period_public", (q) =>
        q.eq("periodId", periodId).eq("isPublic", true),
      )
      .order("desc")
      .take(limit);

    return {
      periodId,
      runs: rows.map((row) => {
        const benchLabel = seededLabelByAddress(row.address);
        return {
          id: row._id,
          handle: benchLabel ? benchmarkHandle(benchLabel) : shortAddress(row.address),
          title: row.title,
          periodId: row.periodId,
          createdAt: row.createdAt,
        };
      }),
    };
  },
});

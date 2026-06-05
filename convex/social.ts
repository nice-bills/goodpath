import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { parseWalletAddress } from "./lib/address";
import { ensureProfile } from "./lib/ensureProfile";
import { okResult, rivalPayload } from "./lib/returns";

const squadMembership = v.object({
  squad_id: v.string(),
  address: v.string(),
  role: v.string(),
  joined_at: v.string(),
});

export const getRival = query({
  args: { address: v.string() },
  returns: rivalPayload,
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    const rival = await ctx.db
      .query("rivalLinks")
      .withIndex("by_user", (q) => q.eq("userAddress", lower))
      .first();
    if (!rival) return { rival: null };
    return {
      rival: {
        address: rival.rivalAddress,
        label: rival.rivalLabel ?? null,
        isSeeded: rival.isSeeded,
      },
    };
  },
});

export const setRival = mutation({
  args: {
    address: v.string(),
    rival: v.string(),
  },
  returns: okResult,
  handler: async (ctx, args) => {
    const user = parseWalletAddress(args.address);
    const rival = parseWalletAddress(args.rival);
    if (user === rival) {
      throw new Error("Cannot rival yourself");
    }
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("rivalLinks")
      .withIndex("by_user", (q) => q.eq("userAddress", user))
      .first();
    if (existing) {
      await ctx.db.patch("rivalLinks", existing._id, {
        rivalAddress: rival,
        rivalLabel: undefined,
        isSeeded: false,
      });
    } else {
      await ctx.db.insert("rivalLinks", {
        userAddress: user,
        rivalAddress: rival,
        isSeeded: false,
        createdAt: now,
      });
    }
    return { ok: true as const };
  },
});

export const listSquads = query({
  args: { address: v.string() },
  returns: v.object({
    squads: v.array(squadMembership),
    stub: v.literal(true),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    const memberships = await ctx.db
      .query("squadMemberships")
      .withIndex("by_address", (q) => q.eq("address", lower))
      .collect();
    return {
      squads: memberships.map((s) => ({
        squad_id: s.squadId,
        address: s.address,
        role: s.role,
        joined_at: s.joinedAt,
      })),
      stub: true as const,
      message: "Squad scoring ships in v2 — data model ready",
    };
  },
});

export const joinSquad = mutation({
  args: {
    address: v.string(),
    squadId: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.literal(true),
    membership: v.union(squadMembership, v.null()),
    stub: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    await ensureProfile(ctx, lower);
    const squadId = args.squadId ?? "goodpath-demo-squad";
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("squadMemberships")
      .withIndex("by_squad_address", (q) =>
        q.eq("squadId", squadId).eq("address", lower),
      )
      .first();
    if (!existing) {
      await ctx.db.insert("squadMemberships", {
        squadId,
        address: lower,
        role: "member",
        joinedAt: now,
      });
    }
    const row = await ctx.db
      .query("squadMemberships")
      .withIndex("by_squad_address", (q) =>
        q.eq("squadId", squadId).eq("address", lower),
      )
      .first();
    return {
      ok: true as const,
      membership: row
        ? {
            squad_id: row.squadId,
            address: row.address,
            role: row.role,
            joined_at: row.joinedAt,
          }
        : null,
      stub: true as const,
    };
  },
});

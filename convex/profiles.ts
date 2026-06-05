import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { buildProfilePayload } from "./lib/profileLogic";
import { ensureProfile } from "./lib/ensureProfile";
import { parseWalletAddress } from "./lib/address";
import { okResult, okOrError, shareInviteResult } from "./lib/returns";

// Wallet auth: callers pass `address` from the connected wallet. Until Convex Auth
// (e.g. Privy JWT) is wired, mutations are not cryptographically bound to the signer.

export const get = query({
  args: {
    address: v.string(),
    /** UTC Monday `YYYY-MM-DD` — from client so queries stay cacheable (no `Date` in query). */
    weekStart: v.string(),
    /** ISO week id e.g. `2026-W23` — from client. */
    periodId: v.string(),
  },
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    return await buildProfilePayload(ctx, lower, {
      weekStart: args.weekStart,
      periodId: args.periodId,
    });
  },
});

export const ensure = mutation({
  args: { address: v.string() },
  returns: okResult,
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    await ensureProfile(ctx, lower);
    return { ok: true as const };
  },
});

export const setReferrer = mutation({
  args: {
    address: v.string(),
    referrer: v.string(),
  },
  returns: okOrError,
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    const refLower = parseWalletAddress(args.referrer);

    if (lower === refLower) {
      return { ok: false as const, error: "Cannot refer yourself" };
    }
    await ensureProfile(ctx, lower);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_address", (q) => q.eq("address", lower))
      .first();

    if (!profile) {
      return { ok: false as const, error: "Profile not found" };
    }

    if (profile.referredBy) {
      if (profile.referredBy.toLowerCase() === refLower) {
        return { ok: true as const };
      }
      return { ok: false as const, error: "Referrer already set" };
    }

    await ctx.db.patch("profiles", profile._id, { referredBy: refLower });

    await ctx.db.insert("receiptEvents", {
      address: lower,
      kind: "referral_set",
      payload: JSON.stringify({ referrer: refLower }),
      createdAt: new Date().toISOString(),
    });

    await ctx.scheduler.runAfter(0, internal.receipt.recordReferralOnChain, {
      referrer: refLower,
      referred: lower,
    });

    return { ok: true as const };
  },
});

export const createShareInvite = mutation({
  args: { address: v.string() },
  returns: shareInviteResult,
  handler: async (ctx, args) => {
    const lower = parseWalletAddress(args.address);
    await ensureProfile(ctx, lower);
    const code = randomHex(8);
    const now = new Date().toISOString();
    await ctx.db.insert("shareInvites", {
      code,
      referrerAddress: lower,
      createdAt: now,
    });
    return {
      code,
      referrer: lower,
      shareUrl: `/r/${code}`,
    };
  },
});

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

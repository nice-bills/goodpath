import { v } from "convex/values";

export const okResult = v.object({
  ok: v.literal(true),
});

export const okOrError = v.union(
  okResult,
  v.object({
    ok: v.literal(false),
    error: v.string(),
  }),
);

export const rivalPayload = v.union(
  v.object({ rival: v.null() }),
  v.object({
    rival: v.object({
      address: v.string(),
      label: v.union(v.string(), v.null()),
      isSeeded: v.boolean(),
    }),
  }),
);

export const impactStats = v.object({
  pathsCompleted: v.number(),
  questCompletions: v.number(),
  tipsSent: v.number(),
  chainProofCount: v.number(),
  walletsOnPath: v.number(),
});

export const questCompleteResult = v.object({
  ok: v.literal(true),
  streak: v.number(),
  pathComplete: v.boolean(),
});

export const shareInviteResult = v.object({
  code: v.string(),
  referrer: v.string(),
  shareUrl: v.string(),
});

export const proofResult = v.union(
  v.object({ ok: v.literal(true) }),
  v.object({ ok: v.literal(false), error: v.string() }),
);

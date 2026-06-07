import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    address: v.string(),
    streak: v.number(),
    lastActiveDate: v.optional(v.string()),
    pathCompletedAt: v.optional(v.string()),
    pathStartedAt: v.optional(v.string()),
    fastestPathSeconds: v.optional(v.number()),
    longestStreak: v.number(),
    referredBy: v.optional(v.string()),
    gMovedWeiWeekStart: v.optional(v.string()),
    gMovedWeiTotal: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_address", ["address"])
    .index("by_referredBy", ["referredBy"]),

  questCompletions: defineTable({
    address: v.string(),
    questId: v.string(),
    txHash: v.optional(v.string()),
    meta: v.optional(v.string()),
    completedAt: v.string(),
    gAmountWei: v.optional(v.string()),
  })
    .index("by_address", ["address"])
    .index("by_address_quest", ["address", "questId"])
    .index("by_quest", ["questId"]),

  seasons: defineTable({
    periodId: v.string(),
    startsAt: v.string(),
    endsAt: v.string(),
    createdAt: v.string(),
  }).index("by_period", ["periodId"]),

  divisionEntries: defineTable({
    seasonId: v.id("seasons"),
    address: v.string(),
    division: v.string(),
    points: v.number(),
    isSeeded: v.boolean(),
    label: v.optional(v.string()),
    updatedAt: v.string(),
  })
    .index("by_season_address", ["seasonId", "address"])
    .index("by_season", ["seasonId"]),

  rivalLinks: defineTable({
    userAddress: v.string(),
    rivalAddress: v.string(),
    rivalLabel: v.optional(v.string()),
    isSeeded: v.boolean(),
    createdAt: v.string(),
  }).index("by_user", ["userAddress"]),

  squadMemberships: defineTable({
    squadId: v.string(),
    address: v.string(),
    role: v.string(),
    joinedAt: v.string(),
  })
    .index("by_address", ["address"])
    .index("by_squad_address", ["squadId", "address"]),

  receiptEvents: defineTable({
    address: v.string(),
    kind: v.string(),
    payload: v.string(),
    createdAt: v.string(),
  }).index("by_address", ["address"]),

  proofEvents: defineTable({
    address: v.string(),
    questId: v.string(),
    proofType: v.string(),
    txHash: v.optional(v.string()),
    meta: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_address", ["address"]),

  shareInvites: defineTable({
    code: v.string(),
    referrerAddress: v.string(),
    createdAt: v.string(),
    redeemedBy: v.optional(v.string()),
  }).index("by_code", ["code"]),

  /** Daily G$ move lock — one bet per GoodDollar claim window. */
  dailyCommitments: defineTable({
    address: v.string(),
    claimPeriod: v.string(),
    useId: v.string(),
    committedAt: v.string(),
    fulfilledAt: v.optional(v.string()),
    bonusGranted: v.optional(v.boolean()),
    /** v2 on-chain escrow — unused in soft v1 */
    escrowWei: v.optional(v.string()),
    escrowTxHash: v.optional(v.string()),
    potStatus: v.optional(v.string()),
  })
    .index("by_address_period", ["address", "claimPeriod"])
    .index("by_address", ["address"]),

  /** User-declared weekly run goal — real wallets only, optional public feed. */
  weeklyGoals: defineTable({
    address: v.string(),
    title: v.string(),
    periodId: v.string(),
    isPublic: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_address_period", ["address", "periodId"])
    .index("by_period_public", ["periodId", "isPublic"]),
});

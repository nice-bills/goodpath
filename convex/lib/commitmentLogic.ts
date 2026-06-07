import {
  COMMITMENT_BONUS_POINTS,
  currentClaimPeriodDate,
  hasClaimedForPeriod,
  isCommitmentUseId,
  questCompletionMatchesCommit,
  type CommitmentUseId,
  type QuestId,
} from "@goodpath/shared";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { normalizeAddress } from "./dates";
import { loadCompletions } from "./leagueLogic";

export async function getCommitmentForPeriod(
  ctx: QueryCtx,
  address: string,
  claimPeriod: string,
) {
  const lower = normalizeAddress(address);
  return await ctx.db
    .query("dailyCommitments")
    .withIndex("by_address_period", (q) =>
      q.eq("address", lower).eq("claimPeriod", claimPeriod),
    )
    .first();
}

export async function tryFulfillCommitment(
  ctx: MutationCtx,
  address: string,
  questId: QuestId,
  meta?: string | null,
  hasTx?: boolean,
): Promise<boolean> {
  const lower = normalizeAddress(address);
  const period = currentClaimPeriodDate();
  const row = await getCommitmentForPeriod(ctx, lower, period);
  if (!row || row.fulfilledAt || !isCommitmentUseId(row.useId)) {
    return false;
  }

  if (!questCompletionMatchesCommit(row.useId, questId, meta, hasTx)) {
    return false;
  }

  const now = new Date().toISOString();
  await ctx.db.patch("dailyCommitments", row._id, {
    fulfilledAt: now,
    bonusGranted: true,
  });

  await ctx.db.insert("receiptEvents", {
    address: lower,
    kind: "daily_commit_fulfilled",
    payload: JSON.stringify({
      useId: row.useId,
      questId,
      bonusPoints: COMMITMENT_BONUS_POINTS,
    }),
    createdAt: now,
  });

  return true;
}

export async function assertCanCommit(
  ctx: QueryCtx,
  address: string,
  claimPeriod: string,
  useId: CommitmentUseId,
): Promise<void> {
  if (!isCommitmentUseId(useId)) {
    throw new Error("Invalid commitment");
  }

  const lower = normalizeAddress(address);
  const completions = await loadCompletions(ctx, lower);

  if (!hasClaimedForPeriod(completions, claimPeriod)) {
    throw new Error("Claim today's G$ before locking a move");
  }

  const existing = await getCommitmentForPeriod(ctx, lower, claimPeriod);
  if (existing) {
    throw new Error("You already locked today's move");
  }
}

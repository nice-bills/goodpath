/** GoodDollar daily claim window resets at 12:00 UTC. */

/** Claim-period id (YYYY-MM-DD) for the window that is currently open. */
export function currentClaimPeriodDate(now = new Date()): string {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  if (now.getUTCHours() < 12) {
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return d.toISOString().slice(0, 10);
}

export function previousClaimPeriodDate(period: string): string {
  const d = new Date(`${period}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Map an ISO timestamp to the claim period it belongs to. */
export function claimPeriodForTimestamp(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return currentClaimPeriodDate();
  return currentClaimPeriodDate(new Date(t));
}

export function isSameClaimPeriod(completedAt: string, period: string): boolean {
  return claimPeriodForTimestamp(completedAt) === period;
}

export function isClaimedForPeriod(
  lastActiveDate: string | null | undefined,
  period?: string,
): boolean {
  if (!lastActiveDate) return false;
  return lastActiveDate === (period ?? currentClaimPeriodDate());
}

/** Format wei string from API as human G$ moved (18 decimals). */
export function formatGsMoved(weiStr: string | undefined): string {
  if (!weiStr) return "0";
  try {
    const wei = BigInt(weiStr);
    const zero = BigInt(0);
    const unit = BigInt("1000000000000000000");
    if (wei === zero) return "0";
    const whole = wei / unit;
    const frac = wei % unit;
    const frac2 = Number(frac) / 1e18;
    const n = Number(whole) + frac2;
    if (n < 0.01) return "<0.01";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toFixed(1);
  } catch {
    return "0";
  }
}

export function formatPathDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** Hours until next GoodDollar daily claim (12:00 UTC). */
export function hoursUntilClaimReset(): { hours: number; minutes: number } {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(12, 0, 0, 0);
  if (now.getTime() >= next.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  const diff = next.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

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
    if (!Number.isFinite(n) || n === 0) return "0";
    if (n < 0.01) return "<0.01";
    return formatCompactNumber(n, { maxFractionDigits: n >= 100 ? 0 : 1 });
  } catch {
    return "0";
  }
}

/** Whole numbers for stats (wallets, tips, quest steps). */
export function formatCount(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "-";
  if (n === 0) return "0";
  return formatCompactNumber(n, { maxFractionDigits: n >= 10_000 ? 1 : 0 });
}

/** League points and similar small integers. */
export function formatPoints(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

function formatCompactNumber(
  n: number,
  opts: { maxFractionDigits: number },
): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${trimTrailingZeros(v, opts.maxFractionDigits)}M`;
  }
  if (abs >= 1_000) {
    const v = n / 1_000;
    return `${trimTrailingZeros(v, opts.maxFractionDigits)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: opts.maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(n);
}

function trimTrailingZeros(n: number, maxFractionDigits: number): string {
  const s = n.toFixed(maxFractionDigits);
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatPathDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** Short relative time for live activity feed. */
export function formatRelativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffMs = Date.now() - t;
  if (diffMs < 60_000) return "just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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

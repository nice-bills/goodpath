import { QUEST_LEAGUE_POINTS, REFERRAL_PATH_BONUS, type QuestId } from "@goodpath/shared";
import { getDb } from "./db.js";

/** ISO week id, e.g. 2026-W22 */
export function getPeriodId(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Monday 00:00:00 UTC for the week containing `date`. */
export function getWeekStartUtc(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

export function computeWeeklyPoints(
  address: string,
  streak: number,
  pathCompletedAt: string | null,
): number {
  const lower = address.toLowerCase();
  const weekStart = getWeekStartUtc();

  const rows = getDb()
    .prepare(
      `SELECT quest_id FROM quest_completions
       WHERE address = ? AND date(completed_at) >= date(?)`,
    )
    .all(lower, weekStart) as { quest_id: string }[];

  let points = 0;
  for (const r of rows) {
    const questId = r.quest_id as QuestId;
    points += QUEST_LEAGUE_POINTS[questId] ?? 3;
  }

  points += Math.min(streak, 14) * 5;

  if (pathCompletedAt && pathCompletedAt.slice(0, 10) >= weekStart) {
    points += 50;
  }

  points += referralBonusPoints(lower);

  return points;
}

function referralBonusPoints(referrerLower: string): number {
  const weekStart = getWeekStartUtc();
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as c FROM profiles
       WHERE lower(referred_by) = ? AND path_completed_at IS NOT NULL
         AND date(path_completed_at) >= date(?)`,
    )
    .get(referrerLower, weekStart) as { c: number };
  return (row?.c ?? 0) * REFERRAL_PATH_BONUS;
}

export function countReferralsCompletedThisWeek(referrerLower: string): number {
  const weekStart = getWeekStartUtc();
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as c FROM profiles
       WHERE lower(referred_by) = ? AND path_completed_at IS NOT NULL
         AND date(path_completed_at) >= date(?)`,
    )
    .get(referrerLower, weekStart) as { c: number };
  return row?.c ?? 0;
}

export function getLeagueStanding(address: string, streak: number, pathCompletedAt: string | null) {
  const lower = address.toLowerCase();
  const periodId = getPeriodId();
  const myPoints = computeWeeklyPoints(lower, streak, pathCompletedAt);

  const addresses = getDb()
    .prepare(
      `SELECT DISTINCT address FROM profiles
       UNION
       SELECT DISTINCT address FROM quest_completions
       WHERE date(completed_at) >= date(?)`,
    )
    .all(getWeekStartUtc()) as { address: string }[];

  const scored = addresses.map(({ address: addr }) => {
    const row = getDb()
      .prepare(
        "SELECT streak, path_completed_at FROM profiles WHERE address = ?",
      )
      .get(addr) as
      | { streak: number; path_completed_at: string | null }
      | undefined;
    const s = row?.streak ?? 0;
    const pathAt = row?.path_completed_at ?? null;
    return {
      address: addr,
      points: computeWeeklyPoints(addr, s, pathAt),
    };
  });

  const active = scored.filter((s) => s.points > 0);
  active.sort((a, b) => b.points - a.points || a.address.localeCompare(b.address));

  const rankIndex = active.findIndex((s) => s.address === lower);
  const totalInLeague = active.length;
  const displayRank = rankIndex >= 0 ? rankIndex + 1 : null;

  const hasTipThisWeek = Boolean(
    getDb()
      .prepare(
        `SELECT 1 FROM quest_completions
         WHERE address = ? AND quest_id = 'tip' AND date(completed_at) >= date(?)`,
      )
      .get(lower, getWeekStartUtc()),
  );

  return {
    periodId,
    points: myPoints,
    rank: myPoints > 0 ? displayRank : null,
    totalInLeague: Math.max(totalInLeague, 1),
    promoted: displayRank != null && displayRank <= 3,
    streakShield: (displayRank != null && displayRank <= 5) || hasTipThisWeek,
  };
}

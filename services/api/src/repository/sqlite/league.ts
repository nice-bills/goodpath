import { getDb } from "../../db/connection.js";
import type { QuestId } from "@goodpath/shared";
import type { LeagueRepository } from "../interfaces.js";

export class SqliteLeagueRepository implements LeagueRepository {
  getPeriodId(date = new Date()): string {
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

  getWeekStartUtc(date = new Date()): string {
    const d = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - (day - 1));
    return d.toISOString().slice(0, 10);
  }

  listActiveAddresses(weekStart: string): string[] {
    const rows = getDb()
      .prepare(
        `SELECT DISTINCT address FROM profiles
       UNION
       SELECT DISTINCT address FROM quest_completions
       WHERE date(completed_at) >= date(?)`,
      )
      .all(weekStart) as { address: string }[];
    return rows.map((r) => r.address);
  }

  getProfileStreakAndPath(address: string) {
    const row = getDb()
      .prepare(
        "SELECT streak, path_completed_at FROM profiles WHERE address = ?",
      )
      .get(address) as
      | { streak: number; path_completed_at: string | null }
      | undefined;
    return {
      streak: row?.streak ?? 0,
      path_completed_at: row?.path_completed_at ?? null,
    };
  }

  listQuestCompletionsSince(address: string, weekStart: string) {
    return getDb()
      .prepare(
        `SELECT quest_id FROM quest_completions
       WHERE address = ? AND date(completed_at) >= date(?)`,
      )
      .all(address, weekStart) as { quest_id: string }[];
  }

  hasTipThisWeek(address: string, weekStart: string): boolean {
    return Boolean(
      getDb()
        .prepare(
          `SELECT 1 FROM quest_completions
         WHERE address = ? AND quest_id = 'tip' AND date(completed_at) >= date(?)`,
        )
        .get(address, weekStart),
    );
  }

  ensureSeason(periodId: string, weekStart: string): string {
    const existing = getDb()
      .prepare("SELECT id FROM seasons WHERE period_id = ?")
      .get(periodId) as { id: string } | undefined;
    if (existing) return existing.id;

    const id = `season-${periodId}`;
    const ends = new Date(`${weekStart}T00:00:00Z`);
    ends.setUTCDate(ends.getUTCDate() + 7);
    getDb()
      .prepare(
        `INSERT INTO seasons (id, period_id, starts_at, ends_at) VALUES (?, ?, ?, ?)`,
      )
      .run(id, periodId, weekStart, ends.toISOString().slice(0, 10));
    return id;
  }

  getDivisionEntries(seasonId: string, userAddress: string) {
    return getDb()
      .prepare(
        `SELECT id, season_id, address, division, points, is_seeded, label
       FROM division_entries
       WHERE season_id = ? AND (address = ? OR is_seeded = 1)
       ORDER BY points DESC, address ASC`,
      )
      .all(seasonId, userAddress.toLowerCase()) as {
      id: number;
      season_id: string;
      address: string;
      division: string;
      points: number;
      is_seeded: number;
      label: string | null;
    }[];
  }

  upsertUserDivisionEntry(
    seasonId: string,
    address: string,
    division: string,
    points: number,
  ): void {
    getDb()
      .prepare(
        `INSERT INTO division_entries (season_id, address, division, points, is_seeded, label)
       VALUES (?, ?, ?, ?, 0, NULL)
       ON CONFLICT(season_id, address) DO UPDATE SET
         division = excluded.division,
         points = excluded.points,
         updated_at = datetime('now')`,
      )
      .run(seasonId, address.toLowerCase(), division, points);
  }

  recordProofEvent(
    address: string,
    questId: QuestId,
    proofType: string,
    txHash: string | null,
    meta: string | null,
  ): void {
    getDb()
      .prepare(
        `INSERT INTO proof_events (address, quest_id, proof_type, tx_hash, meta)
       VALUES (?, ?, ?, ?, ?)`,
      )
      .run(address.toLowerCase(), questId, proofType, txHash, meta);
  }
}

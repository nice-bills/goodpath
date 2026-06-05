import {
  CORE_PATH_QUEST_IDS,
  completionsFromIds,
  prerequisitesMet,
  type QuestId,
} from "@goodpath/shared";
import { getDb } from "../../db/connection.js";
import type { ProfileRepository } from "../interfaces.js";
import type { CompletionRecord, ProfileRow } from "../types.js";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export class QuestPrerequisiteError extends Error {
  constructor(public missing: QuestId) {
    super(`Complete quest "${missing}" first`);
    this.name = "QuestPrerequisiteError";
  }
}

export class SqliteProfileRepository implements ProfileRepository {
  private touchStreakLocked(lower: string): number {
    const profile = getDb()
      .prepare(
        "SELECT streak, last_active_date FROM profiles WHERE address = ?",
      )
      .get(lower) as { streak: number; last_active_date: string | null };

    const today = todayUtc();
    let streak = profile.streak;

    if (profile.last_active_date === today) {
      return streak;
    }
    if (profile.last_active_date === yesterdayUtc()) {
      streak += 1;
    } else {
      streak = 1;
    }

    getDb()
      .prepare(
        "UPDATE profiles SET streak = ?, last_active_date = ? WHERE address = ?",
      )
      .run(streak, today, lower);

    const longest = (
      getDb()
        .prepare("SELECT longest_streak FROM profiles WHERE address = ?")
        .get(lower) as { longest_streak: number }
    ).longest_streak;
    if (streak > longest) {
      getDb()
        .prepare(
          "UPDATE profiles SET longest_streak = ? WHERE address = ?",
        )
        .run(streak, lower);
    }

    return streak;
  }

  private ensureConnectQuest(lower: string): void {
    getDb()
      .prepare(
        `INSERT OR IGNORE INTO quest_completions (address, quest_id, tx_hash, meta)
       VALUES (?, 'connect', NULL, NULL)`,
      )
      .run(lower);
  }

  getProfile(address: string): ProfileRow {
    const lower = normalizeAddress(address);
    let row = getDb()
      .prepare(
        `SELECT address, streak, last_active_date, path_completed_at,
              path_started_at, fastest_path_seconds, longest_streak, referred_by
       FROM profiles WHERE address = ?`,
      )
      .get(lower) as ProfileRow | undefined;

    if (!row) {
      getDb()
        .prepare(
          "INSERT INTO profiles (address, path_started_at) VALUES (?, datetime('now'))",
        )
        .run(lower);
      row = getDb()
        .prepare(
          `SELECT address, streak, last_active_date, path_completed_at,
                path_started_at, fastest_path_seconds, longest_streak, referred_by
         FROM profiles WHERE address = ?`,
        )
        .get(lower) as ProfileRow;
    }

    this.ensureConnectQuest(lower);
    return row;
  }

  getCompletions(address: string): Record<string, CompletionRecord> {
    const lower = normalizeAddress(address);
    const rows = getDb()
      .prepare(
        "SELECT quest_id, completed_at, tx_hash, meta FROM quest_completions WHERE address = ?",
      )
      .all(lower) as {
      quest_id: string;
      completed_at: string;
      tx_hash: string | null;
      meta: string | null;
    }[];

    const out: Record<string, CompletionRecord> = {};
    for (const r of rows) {
      out[r.quest_id] = {
        completedAt: r.completed_at,
        txHash: r.tx_hash,
        meta: r.meta,
      };
    }
    return out;
  }

  getCompletionMap(address: string): Record<string, boolean> {
    const completions = this.getCompletions(address);
    return completionsFromIds(Object.keys(completions));
  }

  countClaimsThisWeek(address: string): number {
    const lower = normalizeAddress(address);
    const weekStart = new Date();
    const day = weekStart.getUTCDay() || 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - (day - 1));
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const row = getDb()
      .prepare(
        `SELECT COUNT(*) as c FROM quest_completions
       WHERE address = ? AND quest_id = 'claim' AND date(completed_at) >= date(?)`,
      )
      .get(lower, weekStartStr) as { c: number };
    return row.c;
  }

  completeQuest(
    address: string,
    questId: QuestId,
    txHash?: string | null,
    meta?: string | null,
  ): { streak: number; pathComplete: boolean } {
    const lower = normalizeAddress(address);

    return getDb().transaction(() => {
      this.getProfile(lower);
      const completionMap = this.getCompletionMap(lower);

      if (completionMap[questId]) {
        return {
          streak: (
            getDb()
              .prepare("SELECT streak FROM profiles WHERE address = ?")
              .get(lower) as { streak: number }
          ).streak,
          pathComplete: Boolean(
            (
              getDb()
                .prepare(
                  "SELECT path_completed_at FROM profiles WHERE address = ?",
                )
                .get(lower) as { path_completed_at: string | null }
            ).path_completed_at,
          ),
        };
      }

      const prereq = prerequisitesMet(questId, completionMap);
      if (!prereq.ok) {
        throw new QuestPrerequisiteError(prereq.missing);
      }

      getDb()
        .prepare(
          `INSERT INTO quest_completions (address, quest_id, tx_hash, meta)
       VALUES (?, ?, ?, ?)`,
        )
        .run(lower, questId, txHash ?? null, meta ?? null);

      getDb()
        .prepare(
          `UPDATE profiles SET path_started_at = COALESCE(path_started_at, datetime('now'))
       WHERE address = ?`,
        )
        .run(lower);

      const streak = this.touchStreakLocked(lower);

      const coreCount = (
        getDb()
          .prepare(
            `SELECT COUNT(*) as c FROM quest_completions
           WHERE address = ? AND quest_id IN (${CORE_PATH_QUEST_IDS.map(() => "?").join(",")})`,
          )
          .get(lower, ...CORE_PATH_QUEST_IDS) as { c: number }
      ).c;

      let pathComplete = false;
      if (coreCount >= CORE_PATH_QUEST_IDS.length) {
        const row = getDb()
          .prepare(
            "SELECT path_started_at, fastest_path_seconds FROM profiles WHERE address = ?",
          )
          .get(lower) as {
          path_started_at: string | null;
          fastest_path_seconds: number | null;
        };
        const started = row.path_started_at
          ? new Date(row.path_started_at).getTime()
          : Date.now();
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - started) / 1000),
        );
        const fastest =
          row.fastest_path_seconds == null
            ? durationSec
            : Math.min(row.fastest_path_seconds, durationSec);

        getDb()
          .prepare(
            `UPDATE profiles SET
           path_completed_at = COALESCE(path_completed_at, datetime('now')),
           fastest_path_seconds = ?
         WHERE address = ?`,
          )
          .run(fastest, lower);
        pathComplete = true;
      }

      return { streak, pathComplete };
    })();
  }

  getImpactStats() {
    const pathsCompleted = (
      getDb()
        .prepare(
          "SELECT COUNT(*) as c FROM profiles WHERE path_completed_at IS NOT NULL",
        )
        .get() as { c: number }
    ).c;

    const questCompletions = (
      getDb().prepare("SELECT COUNT(*) as c FROM quest_completions").get() as {
        c: number;
      }
    ).c;

    const tipsSent = (
      getDb()
        .prepare(
          "SELECT COUNT(*) as c FROM quest_completions WHERE quest_id = 'tip' AND tx_hash IS NOT NULL",
        )
        .get() as { c: number }
    ).c;

    const chainProofCount = (
      getDb()
        .prepare(
          `SELECT COUNT(*) as c FROM quest_completions
         WHERE quest_id IN ('tip','support','deploy') AND tx_hash IS NOT NULL`,
        )
        .get() as { c: number }
    ).c;

    const walletsOnPath = (
      getDb().prepare("SELECT COUNT(*) as c FROM profiles").get() as { c: number }
    ).c;

    return {
      pathsCompleted,
      questCompletions,
      tipsSent,
      chainProofCount,
      walletsOnPath,
    };
  }
}

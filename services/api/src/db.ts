import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import {
  QUESTS,
  QUEST_IDS,
  computeProgress,
  prerequisitesMet,
  completionsFromIds,
  isQuestUnlocked,
  type QuestId,
} from "@goodpath/shared";
import { getLeagueStanding } from "./league.js";

const dataDir = process.env.GOODPATH_DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "goodpath.db");
export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    address TEXT PRIMARY KEY,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    path_completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quest_completions (
    address TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    tx_hash TEXT,
    meta TEXT,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (address, quest_id)
  );
`);

function ensureColumn(table: string, column: string, ddl: string) {
  const cols = db
    .prepare(`PRAGMA table_info(${table})`)
    .all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

ensureColumn("profiles", "path_started_at", "TEXT");
ensureColumn("profiles", "fastest_path_seconds", "INTEGER");
ensureColumn("profiles", "longest_streak", "INTEGER NOT NULL DEFAULT 0");

export interface ProfileRow {
  address: string;
  streak: number;
  last_active_date: string | null;
  path_completed_at: string | null;
  path_started_at: string | null;
  fastest_path_seconds: number | null;
  longest_streak: number;
}

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

function touchStreakLocked(lower: string): number {
  const profile = db
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

  db.prepare(
    "UPDATE profiles SET streak = ?, last_active_date = ? WHERE address = ?",
  ).run(streak, today, lower);

  const longest = (
    db
      .prepare("SELECT longest_streak FROM profiles WHERE address = ?")
      .get(lower) as { longest_streak: number }
  ).longest_streak;
  if (streak > longest) {
    db.prepare("UPDATE profiles SET longest_streak = ? WHERE address = ?").run(
      streak,
      lower,
    );
  }

  return streak;
}

function ensureConnectQuest(lower: string): void {
  db.prepare(
    `INSERT OR IGNORE INTO quest_completions (address, quest_id, tx_hash, meta)
     VALUES (?, 'connect', NULL, NULL)`,
  ).run(lower);
}

export function getProfile(address: string): ProfileRow {
  const lower = normalizeAddress(address);
  let row = db
    .prepare(
      `SELECT address, streak, last_active_date, path_completed_at,
              path_started_at, fastest_path_seconds, longest_streak
       FROM profiles WHERE address = ?`,
    )
    .get(lower) as ProfileRow | undefined;

  if (!row) {
    db.prepare(
      "INSERT INTO profiles (address, path_started_at) VALUES (?, datetime('now'))",
    ).run(lower);
    row = db
      .prepare(
        `SELECT address, streak, last_active_date, path_completed_at,
                path_started_at, fastest_path_seconds, longest_streak
         FROM profiles WHERE address = ?`,
      )
      .get(lower) as ProfileRow;
  }

  ensureConnectQuest(lower);
  return row;
}

export function getCompletions(
  address: string,
): Record<string, { completedAt: string; txHash: string | null }> {
  const lower = normalizeAddress(address);
  const rows = db
    .prepare(
      "SELECT quest_id, completed_at, tx_hash FROM quest_completions WHERE address = ?",
    )
    .all(lower) as {
    quest_id: string;
    completed_at: string;
    tx_hash: string | null;
  }[];

  const out: Record<string, { completedAt: string; txHash: string | null }> = {};
  for (const r of rows) {
    out[r.quest_id] = { completedAt: r.completed_at, txHash: r.tx_hash };
  }
  return out;
}

export function getCompletionMap(address: string): Record<string, boolean> {
  const completions = getCompletions(address);
  return completionsFromIds(Object.keys(completions));
}

function countClaimsThisWeek(lower: string): number {
  const weekStart = new Date();
  const day = weekStart.getUTCDay() || 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - (day - 1));
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const row = db
    .prepare(
      `SELECT COUNT(*) as c FROM quest_completions
       WHERE address = ? AND quest_id = 'claim' AND date(completed_at) >= date(?)`,
    )
    .get(lower, weekStartStr) as { c: number };
  return row.c;
}

export function buildProfilePayload(address: string) {
  const profile = getProfile(address);
  const lower = normalizeAddress(address);
  const completions = getCompletions(address);
  const completedIds = Object.keys(completions);
  const progress = computeProgress(completedIds.length);
  const completionMap = completionsFromIds(completedIds);
  const league = getLeagueStanding(
    lower,
    profile.streak,
    profile.path_completed_at,
  );

  return {
    address: profile.address,
    streak: profile.streak,
    lastActiveDate: profile.last_active_date,
    pathCompletedAt: profile.path_completed_at,
    progress,
    completions,
    personalBests: {
      fastestPathSeconds: profile.fastest_path_seconds,
      longestStreak: Math.max(profile.longest_streak, profile.streak),
      claimsThisWeek: countClaimsThisWeek(lower),
    },
    league,
    quests: QUESTS.map((q) => ({
      ...q,
      completed: Boolean(completions[q.id]),
      completedAt: completions[q.id]?.completedAt ?? null,
      txHash: completions[q.id]?.txHash ?? null,
      unlocked: isQuestUnlocked(q.id, completionMap),
    })),
  };
}

export function completeQuest(
  address: string,
  questId: QuestId,
  txHash?: string | null | undefined,
  meta?: string | null | undefined,
): { streak: number; pathComplete: boolean } {
  const lower = normalizeAddress(address);

  return db.transaction(() => {
    getProfile(lower);
    const completionMap = getCompletionMap(lower);

    if (completionMap[questId]) {
      return {
        streak: (
          db
            .prepare("SELECT streak FROM profiles WHERE address = ?")
            .get(lower) as { streak: number }
        ).streak,
        pathComplete: Boolean(
          (
            db
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

    db.prepare(
      `INSERT INTO quest_completions (address, quest_id, tx_hash, meta)
       VALUES (?, ?, ?, ?)`,
    ).run(lower, questId, txHash ?? null, meta ?? null);

    db.prepare(
      `UPDATE profiles SET path_started_at = COALESCE(path_started_at, datetime('now'))
       WHERE address = ?`,
    ).run(lower);

    const streak = touchStreakLocked(lower);

    const count = (
      db
        .prepare(
          "SELECT COUNT(*) as c FROM quest_completions WHERE address = ?",
        )
        .get(lower) as { c: number }
    ).c;

    let pathComplete = false;
    if (count >= QUEST_IDS.length) {
      const row = db
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
      const durationSec = Math.max(1, Math.round((Date.now() - started) / 1000));
      const fastest =
        row.fastest_path_seconds == null
          ? durationSec
          : Math.min(row.fastest_path_seconds, durationSec);

      db.prepare(
        `UPDATE profiles SET
           path_completed_at = COALESCE(path_completed_at, datetime('now')),
           fastest_path_seconds = ?
         WHERE address = ?`,
      ).run(fastest, lower);
      pathComplete = true;
    }

    return { streak, pathComplete };
  })();
}

export class QuestPrerequisiteError extends Error {
  constructor(public missing: QuestId) {
    super(`Complete quest "${missing}" first`);
    this.name = "QuestPrerequisiteError";
  }
}

export function getImpactStats() {
  const pathsCompleted = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM profiles WHERE path_completed_at IS NOT NULL",
      )
      .get() as { c: number }
  ).c;

  const questCompletions = (
    db.prepare("SELECT COUNT(*) as c FROM quest_completions").get() as { c: number }
  ).c;

  const tipsSent = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM quest_completions WHERE quest_id = 'tip' AND tx_hash IS NOT NULL",
      )
      .get() as { c: number }
  ).c;

  const walletsOnPath = (
    db.prepare("SELECT COUNT(*) as c FROM profiles").get() as { c: number }
  ).c;

  return {
    pathsCompleted,
    questCompletions,
    tipsSent,
    walletsOnPath,
  };
}

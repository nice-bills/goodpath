import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import {
  QUESTS,
  CORE_PATH_QUEST_IDS,
  CHAIN_PROOF_QUEST_IDS,
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  computeProgress,
  prerequisitesMet,
  completionsFromIds,
  isQuestUnlocked,
  type QuestId,
} from "@goodpath/shared";
import { countReferralsCompletedThisWeek, getLeagueStanding } from "./league.js";
import { sumGsMovedWeiThisWeek } from "./chain/g-moved.js";
import {
  divisionLabel,
  nextMoveHint,
  seededDivisionRank,
} from "@goodpath/shared";

const dataDir =
  process.env.GOODPATH_DATA_DIR ??
  (process.env.VERCEL ? "/tmp/goodpath-data" : path.join(process.cwd(), "data"));

const dbPath = path.join(dataDir, "goodpath.db");

let dbInstance: Database.Database | null = null;

/** Open SQLite on first use so `/health` can respond without native bindings. */
export function getDb(): Database.Database {
  if (!dbInstance) {
    fs.mkdirSync(dataDir, { recursive: true });
    dbInstance = new Database(dbPath);
    dbInstance.exec(`
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
      const cols = dbInstance!
        .prepare(`PRAGMA table_info(${table})`)
        .all() as { name: string }[];
      if (!cols.some((c) => c.name === column)) {
        dbInstance!.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
      }
    }

    ensureColumn("profiles", "path_started_at", "TEXT");
    ensureColumn("profiles", "fastest_path_seconds", "INTEGER");
    ensureColumn("profiles", "longest_streak", "INTEGER NOT NULL DEFAULT 0");
    ensureColumn("profiles", "referred_by", "TEXT");
  }
  return dbInstance;
}

export interface ProfileRow {
  address: string;
  streak: number;
  last_active_date: string | null;
  path_completed_at: string | null;
  path_started_at: string | null;
  fastest_path_seconds: number | null;
  longest_streak: number;
  referred_by: string | null;
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

  getDb().prepare(
    "UPDATE profiles SET streak = ?, last_active_date = ? WHERE address = ?",
  ).run(streak, today, lower);

  const longest = (
    getDb()
      .prepare("SELECT longest_streak FROM profiles WHERE address = ?")
      .get(lower) as { longest_streak: number }
  ).longest_streak;
  if (streak > longest) {
    getDb().prepare("UPDATE profiles SET longest_streak = ? WHERE address = ?").run(
      streak,
      lower,
    );
  }

  return streak;
}

function ensureConnectQuest(lower: string): void {
  getDb().prepare(
    `INSERT OR IGNORE INTO quest_completions (address, quest_id, tx_hash, meta)
     VALUES (?, 'connect', NULL, NULL)`,
  ).run(lower);
}

export function getProfile(address: string): ProfileRow {
  const lower = normalizeAddress(address);
  let row = getDb()
    .prepare(
      `SELECT address, streak, last_active_date, path_completed_at,
              path_started_at, fastest_path_seconds, longest_streak, referred_by
       FROM profiles WHERE address = ?`,
    )
    .get(lower) as ProfileRow | undefined;

  if (!row) {
    getDb().prepare(
      "INSERT INTO profiles (address, path_started_at) VALUES (?, datetime('now'))",
    ).run(lower);
    row = getDb()
      .prepare(
        `SELECT address, streak, last_active_date, path_completed_at,
                path_started_at, fastest_path_seconds, longest_streak, referred_by
         FROM profiles WHERE address = ?`,
      )
      .get(lower) as ProfileRow;
  }

  ensureConnectQuest(lower);
  return row;
}

export function setReferrer(address: string, referrer: string): { ok: true } | { ok: false; error: string } {
  const lower = normalizeAddress(address);
  const refLower = normalizeAddress(referrer);

  if (lower === refLower) {
    return { ok: false, error: "Cannot refer yourself" };
  }

  const row = getDb()
    .prepare("SELECT referred_by FROM profiles WHERE address = ?")
    .get(lower) as { referred_by: string | null } | undefined;

  if (!row) {
    getProfile(lower);
  }

  const existing = (
    getDb()
      .prepare("SELECT referred_by FROM profiles WHERE address = ?")
      .get(lower) as { referred_by: string | null }
  ).referred_by;

  if (existing) {
    if (existing.toLowerCase() === refLower) return { ok: true };
    return { ok: false, error: "Referrer already set" };
  }

  getDb().prepare("UPDATE profiles SET referred_by = ? WHERE address = ?").run(refLower, lower);
  return { ok: true };
}

export function getCompletions(
  address: string,
): Record<
  string,
  { completedAt: string; txHash: string | null; meta: string | null }
> {
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

  const out: Record<
    string,
    { completedAt: string; txHash: string | null; meta: string | null }
  > = {};
  for (const r of rows) {
    out[r.quest_id] = {
      completedAt: r.completed_at,
      txHash: r.tx_hash,
      meta: r.meta,
    };
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

  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as c FROM quest_completions
       WHERE address = ? AND quest_id = 'claim' AND date(completed_at) >= date(?)`,
    )
    .get(lower, weekStartStr) as { c: number };
  return row.c;
}

export async function buildProfilePayload(address: string) {
  const profile = getProfile(address);
  const lower = normalizeAddress(address);
  const completions = getCompletions(address);
  const completedIds = Object.keys(completions);
  const coreCompleted = CORE_PATH_QUEST_IDS.filter((id) =>
    Boolean(completions[id]),
  ).length;
  const progress = computeProgress(coreCompleted);
  const completionMap = completionsFromIds(completedIds);
  const standing = getLeagueStanding(
    lower,
    profile.streak,
    profile.path_completed_at,
  );

  const quests = QUESTS.map((q) => ({
    ...q,
    completed: Boolean(completions[q.id]),
    completedAt: completions[q.id]?.completedAt ?? null,
    txHash: completions[q.id]?.txHash ?? null,
    unlocked: isQuestUnlocked(q.id, completionMap),
  }));

  const deployMeta = completions.deploy?.meta;
  const division = seededDivisionRank(standing.points);
  const gMovedWei = await sumGsMovedWeiThisWeek(lower);

  const league = {
    ...standing,
    division: division.division,
    divisionLabel: divisionLabel(division.division),
    divisionRank: division.rank,
    divisionSize: division.divisionSize,
    gMovedWei,
    nextMove: nextMoveHint({
      points: standing.points,
      quests: quests.map((q) => ({
        id: q.id,
        completed: q.completed,
        unlocked: q.unlocked,
      })),
      hasStreamProof: deployMeta === DEPLOY_STREAM_META,
      hasSaveProof: deployMeta === DEPLOY_SAVE_META,
    }),
  };

  const chainProofs = CHAIN_PROOF_QUEST_IDS.filter((id) =>
    Boolean(completions[id]?.txHash),
  ).map((id) => {
    const row = completions[id]!;
    return {
      questId: id,
      txHash: row.txHash as string,
      ...(row.meta ? { meta: row.meta } : {}),
    };
  });

  return {
    address: profile.address,
    streak: profile.streak,
    lastActiveDate: profile.last_active_date,
    pathCompletedAt: profile.path_completed_at,
    progress,
    chainProofs,
    completions,
    personalBests: {
      fastestPathSeconds: profile.fastest_path_seconds,
      longestStreak: Math.max(profile.longest_streak, profile.streak),
      claimsThisWeek: countClaimsThisWeek(lower),
    },
    referredBy: profile.referred_by,
    referralsCompletedThisWeek: countReferralsCompletedThisWeek(lower),
    league,
    quests,
  };
}

export function completeQuest(
  address: string,
  questId: QuestId,
  txHash?: string | null | undefined,
  meta?: string | null | undefined,
): { streak: number; pathComplete: boolean } {
  const lower = normalizeAddress(address);

  return getDb().transaction(() => {
    getProfile(lower);
    const completionMap = getCompletionMap(lower);

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

    getDb().prepare(
      `INSERT INTO quest_completions (address, quest_id, tx_hash, meta)
       VALUES (?, ?, ?, ?)`,
    ).run(lower, questId, txHash ?? null, meta ?? null);

    getDb().prepare(
      `UPDATE profiles SET path_started_at = COALESCE(path_started_at, datetime('now'))
       WHERE address = ?`,
    ).run(lower);

    const streak = touchStreakLocked(lower);

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
      const durationSec = Math.max(1, Math.round((Date.now() - started) / 1000));
      const fastest =
        row.fastest_path_seconds == null
          ? durationSec
          : Math.min(row.fastest_path_seconds, durationSec);

      getDb().prepare(
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
    getDb()
      .prepare(
        "SELECT COUNT(*) as c FROM profiles WHERE path_completed_at IS NOT NULL",
      )
      .get() as { c: number }
  ).c;

  const questCompletions = (
    getDb().prepare("SELECT COUNT(*) as c FROM quest_completions").get() as { c: number }
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

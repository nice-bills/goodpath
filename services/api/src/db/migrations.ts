import type Database from "better-sqlite3";

const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    address TEXT PRIMARY KEY,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    path_completed_at TEXT,
    path_started_at TEXT,
    fastest_path_seconds INTEGER,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    referred_by TEXT,
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
`,
  },
  {
    id: 2,
    sql: `
  CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY,
    period_id TEXT NOT NULL UNIQUE,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS season_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id TEXT NOT NULL,
    address TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(season_id, address),
    FOREIGN KEY (season_id) REFERENCES seasons(id)
  );

  CREATE TABLE IF NOT EXISTS division_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id TEXT NOT NULL,
    address TEXT NOT NULL,
    division TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    is_seeded INTEGER NOT NULL DEFAULT 0,
    label TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(season_id, address),
    FOREIGN KEY (season_id) REFERENCES seasons(id)
  );

  CREATE TABLE IF NOT EXISTS rival_links (
    user_address TEXT PRIMARY KEY,
    rival_address TEXT NOT NULL,
    rival_label TEXT,
    is_seeded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS squad_memberships (
    squad_id TEXT NOT NULL,
    address TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (squad_id, address)
  );

  CREATE TABLE IF NOT EXISTS receipt_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    kind TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS proof_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    proof_type TEXT NOT NULL,
    tx_hash TEXT,
    meta TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS share_invites (
    code TEXT PRIMARY KEY,
    referrer_address TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    redeemed_by TEXT
  );
`,
  },
  {
    id: 3,
    sql: `
  -- Legacy column patches (pre-3.0 SQLite files)
`,
  },
];

function ensureColumn(
  db: Database.Database,
  table: string,
  column: string,
  ddl: string,
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    (
      db.prepare("SELECT id FROM schema_migrations").all() as { id: number }[]
    ).map((r) => r.id),
  );

  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    if (m.id === 3) {
      ensureColumn(db, "profiles", "path_started_at", "TEXT");
      ensureColumn(db, "profiles", "fastest_path_seconds", "INTEGER");
      ensureColumn(db, "profiles", "longest_streak", "INTEGER NOT NULL DEFAULT 0");
      ensureColumn(db, "profiles", "referred_by", "TEXT");
    } else {
      db.exec(m.sql);
    }
    db.prepare("INSERT INTO schema_migrations (id) VALUES (?)").run(m.id);
  }
}

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { runMigrations } from "./migrations.js";

const dataDir =
  process.env.GOODPATH_DATA_DIR ??
  (process.env.VERCEL ? "/tmp/goodpath-data" : path.join(process.cwd(), "data"));

export const dbPath = path.join(dataDir, "goodpath.db");

let dbInstance: Database.Database | null = null;

/** SQLite default; set DATABASE_PROVIDER=postgres for future adapter (not implemented). */
export function databaseProvider(): "sqlite" | "postgres" {
  const p = (process.env.DATABASE_PROVIDER ?? "sqlite").toLowerCase();
  if (p === "postgres") return "postgres";
  return "sqlite";
}

export function getDb(): Database.Database {
  if (databaseProvider() === "postgres") {
    throw new Error(
      "DATABASE_PROVIDER=postgres is not implemented yet — use sqlite (default)",
    );
  }
  if (!dbInstance) {
    fs.mkdirSync(dataDir, { recursive: true });
    dbInstance = new Database(dbPath);
    runMigrations(dbInstance);
  }
  return dbInstance;
}

export function getDataDir(): string {
  return dataDir;
}

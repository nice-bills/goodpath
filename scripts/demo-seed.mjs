#!/usr/bin/env node
/**
 * Reset seeded league / rival rows for a reproducible solo demo.
 * Usage: GOODPATH_DATA_DIR=./data node scripts/demo-seed.mjs [userAddress]
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir =
  process.env.GOODPATH_DATA_DIR ?? path.join(root, "services/api/data");
const dbPath = path.join(dataDir, "goodpath.db");

if (!fs.existsSync(dbPath)) {
  console.log("No database at", dbPath, "— start API once to create it.");
  process.exit(0);
}

const db = new Database(dbPath);
const user = (process.argv[2] ?? "").toLowerCase();

db.exec(`
  DELETE FROM division_entries WHERE is_seeded = 1;
  DELETE FROM rival_links WHERE is_seeded = 1;
`);

if (user && /^0x[a-f0-9]{40}$/.test(user)) {
  db.prepare(
    `DELETE FROM rival_links WHERE user_address = ? AND is_seeded = 1`,
  ).run(user);
  console.log("Cleared seeded rival for", user);
}

console.log("Demo seed reset complete:", dbPath);
db.close();

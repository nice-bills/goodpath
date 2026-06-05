import {
  SEEDED_DIVISION_COHORT,
  type LeagueDivision,
} from "@goodpath/shared";
import { getRepositories } from "../repository/provider.js";
import { getDb } from "../db/connection.js";

/** Stable pseudo-addresses for seeded rivals (demo only). */
export const SEEDED_RIVAL_ADDRESSES = [
  "0xseed000000000000000000000000000000000001",
  "0xseed000000000000000000000000000000000002",
  "0xseed000000000000000000000000000000000003",
] as const;

export function ensureSeededDivisionEntries(
  seasonId: string,
  division: LeagueDivision,
): void {
  const cohort = SEEDED_DIVISION_COHORT[division];
  for (const c of cohort) {
    const hex = Buffer.from(c.id).toString("hex").padEnd(40, "0").slice(0, 40);
    const addr = `0x${hex}`;
    getDb()
      .prepare(
        `INSERT INTO division_entries (season_id, address, division, points, is_seeded, label)
       VALUES (?, ?, ?, ?, 1, ?)
       ON CONFLICT(season_id, address) DO UPDATE SET
         points = excluded.points,
         label = excluded.label`,
      )
      .run(seasonId, addr.toLowerCase(), division, c.points, c.label);
  }
}

export function resetDemoLeagueData(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM division_entries WHERE is_seeded = 1;
    DELETE FROM rival_links WHERE is_seeded = 1;
    DELETE FROM proof_events;
    DELETE FROM receipt_events;
    DELETE FROM share_invites;
  `);
  void getRepositories();
}

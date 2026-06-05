import { getDb } from "../../db/connection.js";
import type { SocialRepository } from "../interfaces.js";
import type { RivalLinkRow, SquadMembershipRow } from "../types.js";

const SEEDED_RIVAL_PREFIX = "seeded:rival:";

export class SqliteSocialRepository implements SocialRepository {
  getRival(userAddress: string): RivalLinkRow | undefined {
    return getDb()
      .prepare(
        `SELECT user_address, rival_address, rival_label, is_seeded, created_at
       FROM rival_links WHERE user_address = ?`,
      )
      .get(userAddress.toLowerCase()) as RivalLinkRow | undefined;
  }

  setRival(
    userAddress: string,
    rivalAddress: string,
    label?: string | null,
    isSeeded = false,
  ): void {
    getDb()
      .prepare(
        `INSERT INTO rival_links (user_address, rival_address, rival_label, is_seeded)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_address) DO UPDATE SET
         rival_address = excluded.rival_address,
         rival_label = excluded.rival_label,
         is_seeded = excluded.is_seeded`,
      )
      .run(
        userAddress.toLowerCase(),
        rivalAddress.toLowerCase(),
        label ?? null,
        isSeeded ? 1 : 0,
      );
  }

  ensureSeededRival(userAddress: string, rivalAddress: string, label: string): void {
    const existing = this.getRival(userAddress);
    if (existing && !existing.is_seeded) return;
    this.setRival(userAddress, rivalAddress, label, true);
  }

  listSquadMemberships(address: string): SquadMembershipRow[] {
    return getDb()
      .prepare(
        `SELECT squad_id, address, role, joined_at FROM squad_memberships WHERE address = ?`,
      )
      .all(address.toLowerCase()) as SquadMembershipRow[];
  }

  stubJoinSquad(address: string, squadId: string): SquadMembershipRow {
    getDb()
      .prepare(
        `INSERT OR IGNORE INTO squad_memberships (squad_id, address, role) VALUES (?, ?, 'member')`,
      )
      .run(squadId, address.toLowerCase());
    return getDb()
      .prepare(
        `SELECT squad_id, address, role, joined_at FROM squad_memberships
       WHERE squad_id = ? AND address = ?`,
      )
      .get(squadId, address.toLowerCase()) as SquadMembershipRow;
  }

  /** Stable pseudo-address for seeded rival slot. */
  static seededRivalAddress(userAddress: string, slot: number): string {
    const hash = Buffer.from(`${userAddress}:${slot}`).toString("hex").slice(0, 40);
    return `${SEEDED_RIVAL_PREFIX}${hash}`.slice(0, 42).padEnd(42, "0");
  }
}

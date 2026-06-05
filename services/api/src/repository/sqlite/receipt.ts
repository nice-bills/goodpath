import { randomBytes } from "node:crypto";
import { getDb } from "../../db/connection.js";
import type { ReceiptRepository } from "../interfaces.js";
import type { ReceiptEventRow, ShareInviteRow } from "../types.js";

export class SqliteReceiptRepository implements ReceiptRepository {
  appendReceiptEvent(
    address: string,
    kind: string,
    payload: Record<string, unknown>,
  ): void {
    getDb()
      .prepare(
        `INSERT INTO receipt_events (address, kind, payload) VALUES (?, ?, ?)`,
      )
      .run(address.toLowerCase(), kind, JSON.stringify(payload));
  }

  listReceiptEvents(address: string, limit = 20): ReceiptEventRow[] {
    return getDb()
      .prepare(
        `SELECT id, address, kind, payload, created_at FROM receipt_events
       WHERE address = ? ORDER BY id DESC LIMIT ?`,
      )
      .all(address.toLowerCase(), limit) as ReceiptEventRow[];
  }

  createShareInvite(referrer: string): ShareInviteRow {
    const code = randomBytes(4).toString("hex");
    getDb()
      .prepare(
        `INSERT INTO share_invites (code, referrer_address) VALUES (?, ?)`,
      )
      .run(code, referrer.toLowerCase());
    return getDb()
      .prepare(
        `SELECT code, referrer_address, created_at, redeemed_by FROM share_invites WHERE code = ?`,
      )
      .get(code) as ShareInviteRow;
  }

  getShareInvite(code: string): ShareInviteRow | undefined {
    return getDb()
      .prepare(
        `SELECT code, referrer_address, created_at, redeemed_by FROM share_invites WHERE code = ?`,
      )
      .get(code.toLowerCase()) as ShareInviteRow | undefined;
  }
}

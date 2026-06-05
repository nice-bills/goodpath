import { getDb } from "../../db/connection.js";
import type { ProofEventRepository } from "../interfaces.js";
import type { ProofEventRow } from "../types.js";

export class SqliteProofEventRepository implements ProofEventRepository {
  listRecent(address: string, limit = 10): ProofEventRow[] {
    return getDb()
      .prepare(
        `SELECT id, address, quest_id, proof_type, tx_hash, meta, created_at
       FROM proof_events WHERE address = ? ORDER BY id DESC LIMIT ?`,
      )
      .all(address.toLowerCase(), limit) as ProofEventRow[];
  }
}

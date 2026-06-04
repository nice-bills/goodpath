import type { Address, Hash } from "viem";
import { getDb } from "../db.js";
import { getWeekStartUtc } from "../league.js";
import { sumUserGsOutflowInTx } from "../verify/gs-outflow.js";

const G_MOVED_QUEST_IDS = ["tip", "support", "deploy"] as const;

export async function sumGsMovedWeiThisWeek(address: string): Promise<string> {
  const lower = address.toLowerCase();
  const weekStart = getWeekStartUtc();
  const rows = getDb()
    .prepare(
      `SELECT quest_id, tx_hash FROM quest_completions
       WHERE address = ? AND tx_hash IS NOT NULL AND date(completed_at) >= date(?)`,
    )
    .all(lower, weekStart) as { quest_id: string; tx_hash: string }[];

  let total = 0n;
  for (const row of rows) {
    if (!G_MOVED_QUEST_IDS.includes(row.quest_id as (typeof G_MOVED_QUEST_IDS)[number])) {
      continue;
    }
    try {
      total += await sumUserGsOutflowInTx(
        lower as Address,
        row.tx_hash as Hash,
      );
    } catch (e) {
      console.warn("[g-moved] skip tx", row.tx_hash, e);
    }
  }
  return total.toString();
}

import { REFERRAL_PATH_BONUS } from "@goodpath/shared";
import { getDb } from "../../db/connection.js";
import type { ReferralRepository } from "../interfaces.js";
import { SqliteProfileRepository } from "./profile.js";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export class SqliteReferralRepository implements ReferralRepository {
  private profiles = new SqliteProfileRepository();

  setReferrer(
    address: string,
    referrer: string,
  ): { ok: true } | { ok: false; error: string } {
    const lower = normalizeAddress(address);
    const refLower = normalizeAddress(referrer);

    if (lower === refLower) {
      return { ok: false, error: "Cannot refer yourself" };
    }

    const row = getDb()
      .prepare("SELECT referred_by FROM profiles WHERE address = ?")
      .get(lower) as { referred_by: string | null } | undefined;

    if (!row) {
      this.profiles.getProfile(lower);
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

    getDb()
      .prepare("UPDATE profiles SET referred_by = ? WHERE address = ?")
      .run(refLower, lower);
    return { ok: true };
  }

  countReferralsCompletedThisWeek(referrerLower: string): number {
    const weekStart = this.weekStart();
    const row = getDb()
      .prepare(
        `SELECT COUNT(*) as c FROM profiles
       WHERE lower(referred_by) = ? AND path_completed_at IS NOT NULL
         AND date(path_completed_at) >= date(?)`,
      )
      .get(referrerLower, weekStart) as { c: number };
    return row?.c ?? 0;
  }

  referralBonusPoints(referrerLower: string, weekStart: string): number {
    const row = getDb()
      .prepare(
        `SELECT COUNT(*) as c FROM profiles
       WHERE lower(referred_by) = ? AND path_completed_at IS NOT NULL
         AND date(path_completed_at) >= date(?)`,
      )
      .get(referrerLower, weekStart) as { c: number };
    return (row?.c ?? 0) * REFERRAL_PATH_BONUS;
  }

  private weekStart(): string {
    const d = new Date();
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - (day - 1));
    return d.toISOString().slice(0, 10);
  }
}

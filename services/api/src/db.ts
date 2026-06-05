/**
 * Legacy DB entry — connection + re-exports for app layer.
 * Business logic lives in domain/ and repository/.
 */
export { getDb, getDataDir, databaseProvider, dbPath } from "./db/connection.js";
export { runMigrations } from "./db/migrations.js";

export { buildProfilePayload } from "./domain/profile.js";
export { getRepositories } from "./repository/provider.js";

import type { QuestId } from "@goodpath/shared";
import { getRepositories } from "./repository/provider.js";
import { QuestPrerequisiteError } from "./repository/sqlite/profile.js";

export { QuestPrerequisiteError };

export function getProfile(address: string) {
  return getRepositories().profile.getProfile(address);
}

export function getCompletions(address: string) {
  return getRepositories().profile.getCompletions(address);
}

export function getCompletionMap(address: string) {
  return getRepositories().profile.getCompletionMap(address);
}

export function completeQuest(
  address: string,
  questId: QuestId,
  txHash?: string | null,
  meta?: string | null,
) {
  return getRepositories().profile.completeQuest(address, questId, txHash, meta);
}

export function setReferrer(address: string, referrer: string) {
  return getRepositories().referral.setReferrer(address, referrer);
}

export function getImpactStats() {
  return getRepositories().profile.getImpactStats();
}

export {
  getPeriodId,
  getWeekStartUtc,
  computeWeeklyPoints,
  getLeagueStanding,
  countReferralsCompletedThisWeek,
} from "./domain/league.js";

import type { QuestId } from "@goodpath/shared";
import type {
  CompletionRecord,
  DivisionEntryRow,
  ProfileRow,
  ProofEventRow,
  ReceiptEventRow,
  RivalLinkRow,
  ShareInviteRow,
  SquadMembershipRow,
} from "./types.js";

export interface ProfileRepository {
  getProfile(address: string): ProfileRow;
  getCompletions(address: string): Record<string, CompletionRecord>;
  getCompletionMap(address: string): Record<string, boolean>;
  completeQuest(
    address: string,
    questId: QuestId,
    txHash?: string | null,
    meta?: string | null,
  ): { streak: number; pathComplete: boolean };
  countClaimsThisWeek(address: string): number;
  getImpactStats(): {
    pathsCompleted: number;
    questCompletions: number;
    tipsSent: number;
    chainProofCount: number;
    walletsOnPath: number;
  };
}

export interface ReferralRepository {
  setReferrer(
    address: string,
    referrer: string,
  ): { ok: true } | { ok: false; error: string };
  countReferralsCompletedThisWeek(referrer: string): number;
  referralBonusPoints(referrer: string, weekStart: string): number;
}

export interface LeagueRepository {
  getWeekStartUtc(date?: Date): string;
  getPeriodId(date?: Date): string;
  listActiveAddresses(weekStart: string): string[];
  getProfileStreakAndPath(
    address: string,
  ): { streak: number; path_completed_at: string | null };
  listQuestCompletionsSince(address: string, weekStart: string): { quest_id: string }[];
  hasTipThisWeek(address: string, weekStart: string): boolean;
  ensureSeason(periodId: string, weekStart: string): string;
  getDivisionEntries(seasonId: string, userAddress: string): DivisionEntryRow[];
  upsertUserDivisionEntry(
    seasonId: string,
    address: string,
    division: string,
    points: number,
  ): void;
  recordProofEvent(
    address: string,
    questId: QuestId,
    proofType: string,
    txHash: string | null,
    meta: string | null,
  ): void;
}

export interface ReceiptRepository {
  appendReceiptEvent(
    address: string,
    kind: string,
    payload: Record<string, unknown>,
  ): void;
  listReceiptEvents(address: string, limit?: number): ReceiptEventRow[];
  createShareInvite(referrer: string): ShareInviteRow;
  getShareInvite(code: string): ShareInviteRow | undefined;
}

export interface SocialRepository {
  getRival(userAddress: string): RivalLinkRow | undefined;
  setRival(
    userAddress: string,
    rivalAddress: string,
    label?: string | null,
    isSeeded?: boolean,
  ): void;
  ensureSeededRival(userAddress: string, rivalAddress: string, label: string): void;
  listSquadMemberships(address: string): SquadMembershipRow[];
  stubJoinSquad(address: string, squadId: string): SquadMembershipRow;
}

export interface ProofEventRepository {
  listRecent(address: string, limit?: number): ProofEventRow[];
}

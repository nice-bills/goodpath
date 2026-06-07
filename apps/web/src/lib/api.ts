import type { QuestDefinition, QuestId } from "@goodpath/shared";
import type { DailyRunState } from "@goodpath/shared";
import { API_URL } from "./env";

export interface QuestStatus extends QuestDefinition {
  completed: boolean;
  completedAt: string | null;
  txHash: string | null;
  unlocked: boolean;
}

export interface PersonalBests {
  fastestPathSeconds: number | null;
  longestStreak: number;
  claimsThisWeek: number;
}

export interface DivisionLeaderboardRow {
  label: string;
  points: number;
  isSeeded: boolean;
  isUser: boolean;
}

export interface LeagueStanding {
  periodId: string;
  points: number;
  rank: number | null;
  totalInLeague: number;
  promoted: boolean;
  streakShield: boolean;
  division?: "bronze" | "silver" | "gold";
  divisionLabel?: string;
  divisionRank?: number;
  divisionSize?: number;
  gMovedWei?: string;
  nextMove?: string;
  divisionLeaderboard?: DivisionLeaderboardRow[];
  personAbove?: { label: string; points: number; gap: number } | null;
  rival?: { address: string; label: string | null; isSeeded: boolean } | null;
}

export interface PublicProfileCard {
  verifiedHuman: boolean;
  streak: number;
  pathComplete: boolean;
  weeklyPoints: number;
  division?: string;
  divisionLabel?: string;
  proofMix: string[];
  gMovedWei: string;
}

export interface ChainProof {
  questId: string;
  txHash: string;
  meta?: string;
  proofType?: string;
}

/** Profile from Convex `profiles.get` or legacy Hono `/api/profile`. */
export interface ProfileResponse {
  address: string;
  streak: number;
  lastActiveDate: string | null;
  pathCompletedAt: string | null;
  progress: number;
  chainProofs?: ChainProof[];
  completions: Record<
    string,
    { completedAt: string; txHash: string | null; meta?: string }
  >;
  personalBests?: PersonalBests;
  league?: LeagueStanding;
  referredBy?: string | null;
  referralsCompletedThisWeek?: number;
  quests: QuestStatus[];
  publicCard?: PublicProfileCard;
  recentProofs?: Array<{
    questId: string;
    proofType: string;
    txHash: string | null;
    createdAt: string;
  }>;
  squads?: Array<{ squad_id: string; address: string; role: string; joined_at: string }>;
  dailyRun?: DailyRunState;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ImpactStats {
  pathsCompleted: number;
  questCompletions: number;
  tipsSent: number;
  chainProofCount?: number;
  walletsOnPath: number;
}

export async function fetchProfile(address: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/api/profile/${address}`, { cache: "no-store" });
  if (!res.ok) throw new ApiError("Failed to load profile", res.status);
  return res.json();
}

export async function fetchImpactStats(): Promise<ImpactStats> {
  const res = await fetch(`${API_URL}/api/stats`, { cache: "no-store" });
  if (!res.ok) throw new ApiError("Failed to load stats", res.status);
  return res.json();
}

export async function completeQuest(
  address: string,
  questId: QuestId,
  body?: { txHash?: string; meta?: string },
): Promise<{ streak: number; pathComplete: boolean }> {
  const res = await fetch(`${API_URL}/api/profile/${address}/quests/${questId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : (data.error?.message ?? "Failed to complete quest");
    throw new ApiError(msg, res.status, data);
  }
  return { streak: data.streak, pathComplete: data.pathComplete };
}

export async function registerReferral(
  address: string,
  referrer: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/api/profile/${address}/referral`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referrer }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : "Failed to register referral";
    throw new ApiError(msg, res.status, data);
  }
  return { ok: true };
}

export async function createShareInvite(
  address: string,
): Promise<{ code: string; referrer: string; shareUrl: string }> {
  const res = await fetch(`${API_URL}/api/profile/${address}/share-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "Failed to create share invite",
      res.status,
      data,
    );
  }
  return data;
}

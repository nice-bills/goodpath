import type { QuestDefinition, QuestId } from "@goodpath/shared";
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

export interface LeagueStanding {
  periodId: string;
  points: number;
  rank: number | null;
  totalInLeague: number;
  promoted: boolean;
  streakShield: boolean;
}

export interface ChainProof {
  questId: string;
  txHash: string;
  meta?: string;
}

export interface ProfileResponse {
  address: string;
  streak: number;
  lastActiveDate: string | null;
  pathCompletedAt: string | null;
  progress: number;
  chainProofs?: ChainProof[];
  completions: Record<string, { completedAt: string; txHash: string | null }>;
  personalBests?: PersonalBests;
  league?: LeagueStanding;
  quests: QuestStatus[];
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

export async function fetchProfile(address: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/api/profile/${address}`, { cache: "no-store" });
  if (!res.ok) throw new ApiError("Failed to load profile", res.status);
  return res.json();
}

export interface ImpactStats {
  pathsCompleted: number;
  questCompletions: number;
  tipsSent: number;
  chainProofCount?: number;
  walletsOnPath: number;
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
        : data.error?.message ?? "Failed to complete quest";
    throw new ApiError(msg, res.status, data);
  }
  return { streak: data.streak, pathComplete: data.pathComplete };
}

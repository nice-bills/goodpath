import type { QuestId } from "@goodpath/shared";

export interface ProfileRow {
  address: string;
  streak: number;
  last_active_date: string | null;
  path_completed_at: string | null;
  path_started_at: string | null;
  fastest_path_seconds: number | null;
  longest_streak: number;
  referred_by: string | null;
}

export interface QuestCompletionRow {
  quest_id: string;
  completed_at: string;
  tx_hash: string | null;
  meta: string | null;
}

export interface CompletionRecord {
  completedAt: string;
  txHash: string | null;
  meta: string | null;
}

export interface SeasonRow {
  id: string;
  period_id: string;
  starts_at: string;
  ends_at: string;
}

export interface DivisionEntryRow {
  id: number;
  season_id: string;
  address: string;
  division: string;
  points: number;
  is_seeded: number;
  label: string | null;
}

export interface RivalLinkRow {
  user_address: string;
  rival_address: string;
  rival_label: string | null;
  is_seeded: number;
  created_at: string;
}

export interface SquadMembershipRow {
  squad_id: string;
  address: string;
  role: string;
  joined_at: string;
}

export interface ReceiptEventRow {
  id: number;
  address: string;
  kind: string;
  payload: string;
  created_at: string;
}

export interface ProofEventRow {
  id: number;
  address: string;
  quest_id: QuestId;
  proof_type: string;
  tx_hash: string | null;
  meta: string | null;
  created_at: string;
}

export interface ShareInviteRow {
  code: string;
  referrer_address: string;
  created_at: string;
  redeemed_by: string | null;
}

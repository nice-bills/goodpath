/** Canonical GoodPath 3.0 product vocabulary (domain layer). */

export type RunId = string;
export type SeasonId = string;
export type DivisionId = string;
export type ProofType =
  | "identity"
  | "claim"
  | "transfer"
  | "support_tx"
  | "support_ack"
  | "deploy_save"
  | "deploy_stream"
  | "referral";

export interface NextMove {
  hint: string;
  proofType?: ProofType;
}

export interface StreakShield {
  active: boolean;
  reason: "top5" | "tip_this_week" | null;
}

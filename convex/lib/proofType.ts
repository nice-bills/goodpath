import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  SUPPORT_ACK_META,
  type QuestId,
} from "@goodpath/shared";

export type ProofType =
  | "identity"
  | "claim"
  | "transfer"
  | "support_tx"
  | "support_ack"
  | "deploy_save"
  | "deploy_stream";

export function proofTypeForQuest(
  questId: QuestId,
  meta?: string | null,
  hasTx?: boolean,
): ProofType {
  switch (questId) {
    case "verify":
      return "identity";
    case "claim":
      return "claim";
    case "tip":
      return "transfer";
    case "support":
      return hasTx ? "support_tx" : meta === SUPPORT_ACK_META ? "support_ack" : "support_ack";
    case "deploy":
      return meta === DEPLOY_STREAM_META ? "deploy_stream" : "deploy_save";
    default:
      return "claim";
  }
}

export { DEPLOY_SAVE_META, DEPLOY_STREAM_META };

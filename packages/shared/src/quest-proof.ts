import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  SUPPORT_ACK_META,
  type QuestId,
} from "./quests";

export type QuestProofInput = {
  txHash?: string;
  meta?: string;
};

/** Returns an error message when body is invalid for this quest, else null. */
export function validateQuestProofBody(
  questId: QuestId,
  proof: QuestProofInput,
): string | null {
  if (proof.meta !== undefined) {
    switch (questId) {
      case "support":
        if (proof.meta !== SUPPORT_ACK_META) {
          return "Invalid support completion meta";
        }
        break;
      case "deploy":
        if (
          proof.meta !== DEPLOY_SAVE_META &&
          proof.meta !== DEPLOY_STREAM_META
        ) {
          return "Invalid deploy mode";
        }
        break;
      default:
        return "meta not allowed for this quest";
    }
  }
  return null;
}

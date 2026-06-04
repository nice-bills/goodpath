import { z } from "zod";
import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  QUEST_IDS,
  SUPPORT_ACK_META,
  type QuestId,
} from "./quests.js";

export { DEPLOY_SAVE_META, DEPLOY_STREAM_META, SUPPORT_ACK_META };

export const questIdSchema = z.enum(
  QUEST_IDS as [QuestId, QuestId, ...QuestId[]],
);

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

const questMetaSchema = z.enum([
  SUPPORT_ACK_META,
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
]);

export const completeQuestBodySchema = z.object({
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
  meta: questMetaSchema.optional(),
});

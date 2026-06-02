import { z } from "zod";
import { QUEST_IDS, type QuestId } from "./quests";

export const questIdSchema = z.enum(
  QUEST_IDS as [QuestId, QuestId, ...QuestId[]],
);

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const completeQuestBodySchema = z.object({
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
  meta: z.string().max(500).optional(),
});

import { SUPPORT_ACK_META } from "./quests";
export { SUPPORT_ACK_META };

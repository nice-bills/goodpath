import type { QuestId } from "./quests";

/** Weekly league points per quest completion (this ISO week). */
export const QUEST_LEAGUE_POINTS: Record<QuestId, number> = {
  connect: 2,
  verify: 8,
  claim: 10,
  tip: 6,
  support: 6,
  deploy: 12,
};

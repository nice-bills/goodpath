import { CORE_PATH_QUEST_IDS } from "./quests";

export function computeProgress(
  completedCount: number,
  total: number = CORE_PATH_QUEST_IDS.length,
): number {
  if (total <= 0) return 0;
  return Math.round((completedCount / total) * 100);
}

import { QUESTS, type QuestId } from "./quests";

export type CompletionMap = Record<string, boolean>;

export function completionsFromIds(completedIds: string[]): CompletionMap {
  const map: CompletionMap = {};
  for (const id of completedIds) map[id] = true;
  return map;
}

/** Prior quests by `order` must be completed before this one. */
export function prerequisitesMet(
  questId: QuestId,
  completions: CompletionMap,
): { ok: true } | { ok: false; missing: QuestId } {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) return { ok: false, missing: "connect" };

  for (const prior of QUESTS) {
    if (prior.order >= quest.order) break;
    if (!completions[prior.id]) {
      return { ok: false, missing: prior.id };
    }
  }
  return { ok: true };
}

export function isQuestUnlocked(
  questId: QuestId,
  completions: CompletionMap,
): boolean {
  return prerequisitesMet(questId, completions).ok;
}

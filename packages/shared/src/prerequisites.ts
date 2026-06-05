import { QUESTS, CORE_PATH_QUEST_IDS, type QuestId } from "./quests.js";

export type CompletionMap = Record<string, boolean>;

export function completionsFromIds(completedIds: string[]): CompletionMap {
  const map: CompletionMap = {};
  for (const id of completedIds) map[id] = true;
  return map;
}

function coreCompletions(completions: CompletionMap): CompletionMap {
  const map: CompletionMap = {};
  for (const id of CORE_PATH_QUEST_IDS) {
    if (completions[id]) map[id] = true;
  }
  return map;
}

export function isCorePathComplete(completions: CompletionMap): boolean {
  return CORE_PATH_QUEST_IDS.every((id) => Boolean(completions[id]));
}

/** Prior quests by `order` must be completed before this one. */
export function prerequisitesMet(
  questId: QuestId,
  completions: CompletionMap,
): { ok: true } | { ok: false; missing: QuestId } {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) return { ok: false, missing: "connect" };

  if (quest.postPath) {
    if (!isCorePathComplete(completions)) {
      const missing =
        CORE_PATH_QUEST_IDS.find((id) => !completions[id]) ?? "support";
      return { ok: false, missing };
    }
    return { ok: true };
  }

  const core = coreCompletions(completions);
  for (const prior of QUESTS) {
    if (prior.postPath) break;
    if (prior.order >= quest.order) break;
    if (!core[prior.id]) {
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

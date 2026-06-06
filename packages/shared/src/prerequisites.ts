import { QUESTS, CORE_PATH_QUEST_IDS, type QuestId } from "./quests.js";

export type CompletionMap = Record<string, boolean>;

export function completionsFromIds(completedIds: string[]): CompletionMap {
  const map: CompletionMap = {};
  for (const id of completedIds) map[id] = true;
  return map;
}

export function isCorePathComplete(completions: CompletionMap): boolean {
  return CORE_PATH_QUEST_IDS.every((id) => Boolean(completions[id]));
}

/**
 * Connect → verify, then every remaining quest is open (any order).
 * Deploy still counts as post-path for progress %, but is not gated behind tip/support.
 */
export function prerequisitesMet(
  questId: QuestId,
  completions: CompletionMap,
): { ok: true } | { ok: false; missing: QuestId } {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) return { ok: false, missing: "connect" };

  if (questId === "connect") return { ok: true };

  if (!completions.connect) {
    return { ok: false, missing: "connect" };
  }

  if (questId === "verify") return { ok: true };

  if (!completions.verify) {
    return { ok: false, missing: "verify" };
  }

  return { ok: true };
}

export function isQuestUnlocked(
  questId: QuestId,
  completions: CompletionMap,
): boolean {
  return prerequisitesMet(questId, completions).ok;
}

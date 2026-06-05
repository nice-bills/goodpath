export type QuestVisualState = "locked" | "active" | "done";

const styles: Record<QuestVisualState, string> = {
  locked: "bg-surface-muted text-muted border-border",
  active: "bg-accent-soft text-accent-text border-accent/30",
  done: "bg-win-soft text-win border-win/25",
};

const labels: Record<QuestVisualState, string> = {
  locked: "Locked",
  active: "Active",
  done: "Done",
};

export function QuestStateBadge({ state }: { state: QuestVisualState }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}

export function questVisualState(quest: {
  completed: boolean;
  unlocked: boolean;
}): QuestVisualState {
  if (quest.completed) return "done";
  if (quest.unlocked) return "active";
  return "locked";
}

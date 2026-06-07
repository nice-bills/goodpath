export type QuestVisualState = "locked" | "open" | "active" | "due" | "done";

const styles: Record<QuestVisualState, string> = {
  locked: "bg-surface-muted text-muted border-border",
  open: "bg-surface text-foreground border-border-strong",
  active: "bg-accent-soft text-accent-text border-accent/30",
  due: "bg-accent-soft text-accent-text border-accent/40",
  done: "bg-win-soft text-win border-win/25",
};

const labels: Record<QuestVisualState, string> = {
  locked: "Locked",
  open: "Open",
  active: "Active",
  due: "Due today",
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

export function questVisualState(
  quest: {
    completed: boolean;
    unlocked: boolean;
  },
  options?: { selected?: boolean; reclaimDue?: boolean },
): QuestVisualState {
  if (quest.completed && options?.reclaimDue) {
    return options.selected ? "active" : "due";
  }
  if (quest.completed) return "done";
  if (!quest.unlocked) return "locked";
  if (options?.selected) return "active";
  return "open";
}

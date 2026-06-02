import type { QuestStatus } from "@/lib/api";
import { QuestWhy } from "./quest-why";

export function QuestPanel({
  quest,
  children,
  variant = "standalone",
}: {
  quest: QuestStatus;
  children: React.ReactNode;
  variant?: "standalone" | "embedded";
}) {
  if (variant === "embedded") {
    return <div className="space-y-3">{children}</div>;
  }

  return (
    <div className="card p-4">
      <p className="font-semibold">{quest.title}</p>
      <p className="mt-1 text-sm text-muted">{quest.description}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
        {quest.rewardLabel}
      </p>
      <QuestWhy text={quest.whyItMatters} />
      {children}
    </div>
  );
}

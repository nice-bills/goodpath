"use client";

import { Fire } from "@phosphor-icons/react";

export function StreakBadge({ streak }: { streak: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-streak-soft px-2.5 py-1 text-xs font-semibold text-streak">
      <Fire className="h-3.5 w-3.5" weight="fill" aria-hidden />
      <span className="font-mono tabular-nums">{streak}</span>
      <span className="font-normal text-streak/80">day{streak === 1 ? "" : "s"}</span>
    </span>
  );
}

"use client";

import { XCircle, Prohibit } from "@phosphor-icons/react";
import type { QuestErrorDisplay } from "@/lib/quest-errors";

export function QuestErrorAlert({ error }: { error: QuestErrorDisplay }) {
  const cancelled = error.tone === "cancelled";
  const Icon = cancelled ? Prohibit : XCircle;

  return (
    <div
      className={`mt-3 rounded-xl border px-4 py-3 ${
        cancelled
          ? "border-border-strong bg-surface-muted"
          : "border-loss/25 bg-loss-soft"
      }`}
      role="alert"
    >
      <div className="flex gap-3">
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${cancelled ? "text-muted" : "text-loss"}`}
          weight="fill"
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className={`text-sm font-semibold ${cancelled ? "text-foreground" : "text-loss"}`}>
            {error.title}
          </p>
          <p className="text-xs leading-relaxed text-muted">{error.message}</p>
          {error.hint && (
            <p className="text-xs leading-relaxed text-foreground/80">{error.hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

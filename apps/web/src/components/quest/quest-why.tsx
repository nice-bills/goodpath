"use client";

import { useState } from "react";
import { Info } from "@phosphor-icons/react";

export function QuestWhy({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground"
        aria-expanded={open}
      >
        <Info className="size-3.5" weight="bold" aria-hidden />
        Why this matters
      </button>
      {open && (
        <p className="mt-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs leading-relaxed text-muted">
          {text}
        </p>
      )}
    </div>
  );
}

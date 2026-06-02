"use client";

import { useDemoMode } from "@/hooks/use-demo-mode";

export function DemoModeBanner() {
  const { canUseDemo, active, ready, toggle, enable } = useDemoMode();

  if (!ready || !canUseDemo) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-strong bg-surface-muted px-3 py-2">
      <p className="text-xs text-muted">
        {active ? (
          <>
            <strong className="text-foreground">Demo mode</strong>: sample path & receipt
            (no chain)
          </>
        ) : (
          <>
            Judging? Preview the full path without wallet or CELO.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={active ? toggle : enable}
        className="shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-canvas"
      >
        {active ? "Exit demo" : "Try demo mode"}
      </button>
    </div>
  );
}

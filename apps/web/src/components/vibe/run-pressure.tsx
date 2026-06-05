"use client";

import type { ProfileResponse } from "@/lib/api";
import { TrendUp } from "@phosphor-icons/react";

/** Personal FOMO — only real profile / league data, no fake runners. */
export function RunPressure({ profile }: { profile: ProfileResponse }) {
  const above = profile.league?.personAbove;

  if (!above?.gap) return null;

  return (
    <div className="vibe-pressure" role="status">
      {above && above.gap > 0 ? (
        <div className="vibe-pressure-row vibe-pressure-row-gap">
          <TrendUp className="h-5 w-5 shrink-0" weight="duotone" aria-hidden />
          <p className="vibe-pressure-sub">
            <span className="font-semibold text-foreground">{above.gap} pts</span> behind{" "}
            <span className="font-mono">{above.label.replace(/^Benchmark\s*·\s*/i, "")}</span>{" "}
            in your division — one on-chain move closes the gap.
          </p>
        </div>
      ) : null}
    </div>
  );
}

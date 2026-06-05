"use client";

import { Lightning } from "@phosphor-icons/react";
import type { ReturnPulse } from "@/hooks/use-return-pulse";

export function ReturnPulseBanner({
  pulse,
  onDismiss,
}: {
  pulse: ReturnPulse;
  onDismiss: () => void;
}) {
  return (
    <div className="vibe-return-pulse" role="status">
      <div className="vibe-return-pulse-icon" aria-hidden>
        <Lightning className="h-5 w-5" weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="vibe-return-pulse-title">{pulse.title}</p>
        <p className="vibe-return-pulse-body">{pulse.body}</p>
      </div>
      <button type="button" className="vibe-return-pulse-dismiss" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}

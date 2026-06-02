"use client";

import { GasPump } from "@phosphor-icons/react";

export function GasSponsorBanner({
  phase,
  message,
  caution,
}: {
  phase: "idle" | "checking" | "sponsoring" | "ready" | "failed";
  message: string | null;
  /** True when on-chain CELO is above our minimum but may still fail MetaMask's estimate. */
  caution?: boolean;
}) {
  if (phase === "idle" && !message) return null;

  const toneClass =
    phase === "failed"
      ? "gas-passport-note--failed"
      : phase === "ready" && caution
        ? "gas-passport-note--active"
        : phase === "ready"
          ? "gas-passport-note--ready"
          : "gas-passport-note--active";

  return (
    <div className={`gas-passport-note ${toneClass}`} role="status">
      <GasPump className="size-4" weight="fill" aria-hidden />
      <span>
        {phase === "checking" || phase === "sponsoring"
          ? message ?? "GoodDollar is covering gas for this step…"
          : message}
      </span>
    </div>
  );
}

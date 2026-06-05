"use client";

import { X, Wallet } from "@phosphor-icons/react";

export function WalletGateToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="wallet-gate-toast card" role="status" aria-live="polite">
      <Wallet className="h-4 w-4 shrink-0" weight="duotone" aria-hidden />
      <p className="flex-1 text-xs font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="wallet-gate-toast-dismiss"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" weight="bold" />
      </button>
    </div>
  );
}

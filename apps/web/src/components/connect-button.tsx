"use client";

import { useState } from "react";
import { useDisconnect } from "wagmi";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { SignOut } from "@phosphor-icons/react";
import { WalletModal } from "@/components/wallet-modal";
import { isPrivyEnabled } from "@/lib/privy-config";
import { ConnectButtonPrivy } from "@/components/connect-button-privy";

function ConnectButtonLegacy({ variant = "compact" }: { variant?: "compact" | "pill" }) {
  const { address, status } = useWalletSession();
  const { disconnect } = useDisconnect();
  const [modalOpen, setModalOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  if (status === "ready" && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={
          variant === "pill"
            ? "btn-secondary connect-wallet-trigger gap-2 text-sm"
            : "header-wallet-chip connect-wallet-trigger inline-flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap"
        }
        title="Disconnect"
      >
        <span className="font-mono tabular-nums">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <SignOut className="h-3.5 w-3.5 text-muted" weight="bold" aria-hidden />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpening(true);
          setModalOpen(true);
          queueMicrotask(() => setOpening(false));
        }}
        className={
          variant === "pill"
            ? "btn-primary connect-wallet-trigger"
            : "btn-secondary connect-wallet-trigger text-xs px-3 py-2"
        }
        aria-busy={opening}
      >
        {opening
          ? "Opening…"
          : status === "linking"
            ? "Setting up wallet…"
            : "Connect wallet"}
      </button>
      <WalletModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setOpening(false);
        }}
      />
    </>
  );
}

export function ConnectButton({ variant = "compact" }: { variant?: "compact" | "pill" }) {
  if (isPrivyEnabled) {
    return <ConnectButtonPrivy variant={variant} />;
  }
  return <ConnectButtonLegacy variant={variant} />;
}

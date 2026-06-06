"use client";

import { useState } from "react";
import { useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { SignOut } from "@phosphor-icons/react";
import { WalletModal } from "@/components/wallet-modal";
import { useWalletSession } from "@/hooks/use-wallet-session";

export function ConnectButtonPrivy({ variant = "compact" }: { variant?: "compact" | "pill" }) {
  const { status, address: walletAddress, isLinking } = useWalletSession();
  const { disconnect } = useDisconnect();
  const { logout, authenticated, ready } = usePrivy();
  const [modalOpen, setModalOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const openModal = () => {
    setOpening(true);
    setModalOpen(true);
    queueMicrotask(() => setOpening(false));
  };

  const handleDisconnect = () => {
    disconnect();
    if (authenticated) void logout();
  };

  const showWalletModal = modalOpen && !walletAddress;

  if (ready && status === "ready" && walletAddress) {
    return (
      <button
        type="button"
        onClick={handleDisconnect}
        className={
          variant === "pill"
            ? "btn-secondary connect-wallet-trigger gap-2 text-sm"
            : "header-wallet-chip connect-wallet-trigger inline-flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap"
        }
        title="Disconnect"
      >
        <span className="font-mono tabular-nums">
          {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
        </span>
        <SignOut className="h-3.5 w-3.5 text-muted" weight="bold" aria-hidden />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          variant === "pill"
            ? "btn-primary connect-wallet-trigger"
            : "btn-secondary connect-wallet-trigger text-xs px-3 py-2"
        }
        aria-busy={opening || (!ready && modalOpen)}
        data-pressed={opening || modalOpen ? "true" : undefined}
      >
        {opening
          ? "Opening…"
          : status === "linking" || isLinking
            ? "Creating Celo wallet…"
            : authenticated
              ? "Finish setup"
              : "Connect wallet"}
      </button>
      <WalletModal
        open={showWalletModal}
        onClose={() => {
          setModalOpen(false);
          setOpening(false);
        }}
      />
    </>
  );
}

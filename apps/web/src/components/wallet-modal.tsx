"use client";

import { useEffect, useRef } from "react";
import { celo } from "wagmi/chains";
import { useConnect, useConnectors, useChainId, useSwitchChain } from "wagmi";
import { X, ArrowSquareOut, DeviceMobile } from "@phosphor-icons/react";
import { hasBrowserWallet, walletLabel } from "@/lib/ethereum";
import {
  clearWalletConnectStorage,
  isMetaMaskInAppBrowser,
  isMobileBrowser,
  metamaskDappBrowserUrl,
  shouldOfferWalletConnect,
} from "@/lib/mobile-wallet";
import { WC_PROJECT_ID } from "@/lib/env";
import { isPrivyEnabled } from "@/lib/privy-config";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import {
  PrivyLoginOptions,
  PrivyWalletLoginButton,
} from "@/components/privy-login-options";

function friendlyConnectError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("rejected")) {
    return "Connection cancelled in your wallet.";
  }
  if (
    lower.includes("connection interrupted") ||
    lower.includes("subscribe") ||
    lower.includes("websocket") ||
    lower.includes("socket")
  ) {
    return "WalletConnect lost connection (common on mobile Safari). Use Open in MetaMask browser below, then tap Connect MetaMask.";
  }
  if (lower.includes("not found") || lower.includes("provider")) {
    return "Could not reach MetaMask. Try Open in MetaMask browser below.";
  }
  return message;
}

function LegacyWalletOptions({ onClose }: { onClose: () => void }) {
  const connectors = useConnectors();
  const { connect, isPending, error, reset } = useConnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const mobile = isMobileBrowser();
  const inMetaMaskBrowser = isMetaMaskInAppBrowser();
  const browserWallet = hasBrowserWallet();
  const injected = connectors.find((c) => c.id === "injected" || c.type === "injected");
  const walletConnectConnector = connectors.find((c) => c.id === "walletConnect");
  const canWalletConnect = Boolean(walletConnectConnector && WC_PROJECT_ID && shouldOfferWalletConnect());

  const afterConnect = () => {
    if (chainId !== celo.id) {
      switchChain({ chainId: celo.id }, { onError: () => onClose() });
    }
    onClose();
  };

  const connectInjected = () => {
    if (!injected) return;
    connect({ connector: injected }, { onSuccess: afterConnect });
  };

  const connectMobile = () => {
    if (!walletConnectConnector) return;
    connect({ connector: walletConnectConnector }, { onSuccess: afterConnect });
  };

  const retryAfterWalletConnectError = () => {
    clearWalletConnectStorage();
    reset();
  };

  const showInjected = Boolean(browserWallet && injected);
  const showMetaMaskBrowserLink = mobile && !inMetaMaskBrowser;
  const showWalletConnect = canWalletConnect;

  return (
    <div className="space-y-2">
      {showMetaMaskBrowserLink && (
        <a
          href={metamaskDappBrowserUrl()}
          className="btn-primary wallet-connect-wallet flex w-full items-center justify-center gap-2"
        >
          Open in MetaMask browser
          <ArrowSquareOut className="size-4" weight="bold" aria-hidden />
        </a>
      )}

      {showInjected && (
        <button
          type="button"
          disabled={isPending || isSwitching}
          onClick={connectInjected}
          className={
            showMetaMaskBrowserLink
              ? "btn-secondary wallet-connect-google mt-2 w-full"
              : "btn-primary wallet-connect-wallet w-full"
          }
        >
          {isPending
            ? "Connecting…"
            : inMetaMaskBrowser
              ? "Connect MetaMask"
              : `Connect ${walletLabel()}`}
        </button>
      )}

      {showWalletConnect && (
        <button
          type="button"
          disabled={isPending || isSwitching}
          onClick={connectMobile}
          className="btn-secondary wallet-connect-email mt-2 w-full"
        >
          {isPending ? (
            "Connecting…"
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <DeviceMobile className="size-4" weight="bold" aria-hidden />
              Connect via WalletConnect
            </span>
          )}
        </button>
      )}

      {!showWalletConnect && !showInjected && !showMetaMaskBrowserLink && (
        <div className="rounded-[16px] border-2 border-dashed border-border-strong bg-surface-muted px-4 py-5 text-center">
          <p className="text-sm font-semibold">Wallet connect unavailable</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Install MetaMask, then use Open in MetaMask browser above.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 space-y-2" role="alert">
          <p className="gas-passport-note gas-passport-note--failed">
            {friendlyConnectError(error.message)}
          </p>
          {error.message.toLowerCase().includes("connection interrupted") && (
            <button
              type="button"
              className="btn-secondary w-full text-xs"
              onClick={retryAfterWalletConnectError}
            >
              Clear session & try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PrivyModalSignIn({ onClose }: { onClose: () => void }) {
  const { ready } = usePrivy();

  if (!ready) {
    return (
      <p className="mt-4 text-xs text-muted" role="status">
        Preparing sign-in…
      </p>
    );
  }

  return (
    <>
      <p className="wallet-connect-fast-label">Recommended on desktop, usually under 10s</p>
      <PrivyWalletLoginButton onClose={onClose} disabled={false} />
      <p className="wallet-connect-divider">or sign in with email / Google</p>
      <p className="wallet-connect-slow-hint text-xs text-muted">
        Email creates a Privy wallet (first time can take 30–90s). Use MetaMask above if
        you&apos;re in a hurry.
      </p>
      <PrivyLoginOptions onClose={onClose} />
      <div className="wallet-sheet-note">
        <strong>GoodDollar covers gas</strong>
        <span className="wallet-sheet-note-detail">
          WHEN YOU CLAIM: SAME AS GOODWALLET. NO CELO NEEDED TO START.
        </span>
      </div>
      <PrivyResetSignIn />
    </>
  );
}

function PrivyResetSignIn() {
  const { authenticated, logout, ready } = usePrivy();
  const { isConnected } = useAccount();
  if (!ready || (!authenticated && isConnected)) return null;
  if (authenticated && isConnected) return null;

  return (
    <button
      type="button"
      className="wallet-connect-back mt-2 w-full"
      onClick={() => void logout()}
    >
      Stuck? Reset sign-in
    </button>
  );
}

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inMetaMaskBrowser = isMetaMaskInAppBrowser();
  const mobile = isMobileBrowser();

  return (
    <div
      className="wallet-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="wallet-sheet">
        <div className="wallet-sheet-body">
          <div className="wallet-sheet-head">
            <div>
              <span className="eyebrow">Step 1 · Connect</span>
              {isPrivyEnabled ? (
                <h2 id="wallet-modal-title" className="wallet-sheet-title">
                  Pick how you want to sign in. Everything runs on Celo.
                </h2>
              ) : (
                <>
                  <h2 id="wallet-modal-title" className="font-display">
                    Connect wallet
                  </h2>
                  <p className="wallet-sheet-sub">
                    {inMetaMaskBrowser
                      ? "You’re in MetaMask’s browser. Connect directly below."
                      : mobile
                        ? "On phone, open inside MetaMask (recommended). WalletConnect is a fallback."
                        : "We’ll switch you to Celo if needed."}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="wallet-sheet-close"
              aria-label="Close"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>

          {isPrivyEnabled ? (
            <PrivyModalSignIn onClose={onClose} />
          ) : (
            <LegacyWalletOptions onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

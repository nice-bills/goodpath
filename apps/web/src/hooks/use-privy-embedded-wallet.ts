"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreateWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import type { ConnectedWallet } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useAccount } from "wagmi";
import { pickPrivyWallet, walletAlreadyExistsError } from "@/lib/privy-embedded-wallet";

export type PrivyWalletSetupPhase =
  | "idle"
  | "creating"
  | "linking"
  | "ready"
  | "slow"
  | "failed";

const WALLET_WAIT_MS = 90_000;
/** Show MetaMask escape hatch after this long in setup UI */
export const PRIVY_SETUP_SLOW_MS = 8_000;

async function waitForConnectedWallet(
  getWallets: () => ConnectedWallet[],
  timeoutMs = WALLET_WAIT_MS,
): Promise<ConnectedWallet> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const wallet = pickPrivyWallet(getWallets());
    if (wallet) return wallet;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    "Wallet setup timed out (90s). Privy’s servers may be slow — reset sign-in or use MetaMask below.",
  );
}

/**
 * Privy docs: createOnLogin does NOT run for useLoginWithEmail / loginWithCode (whitelabel).
 * We must call createWallet() right after OTP, then setActiveWallet for wagmi.
 */
export function usePrivyEmbeddedWalletLink(options?: { autoRestore?: boolean }) {
  const autoRestore = options?.autoRestore ?? false;
  const { ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected, address: wagmiAddress } = useAccount();
  const walletsRef = useRef(wallets);
  walletsRef.current = wallets;

  const [phase, setPhase] = useState<PrivyWalletSetupPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const embeddedAddress = pickPrivyWallet(wallets)?.address as `0x${string}` | undefined;
  const displayAddress = (isConnected ? wagmiAddress : undefined) ?? embeddedAddress;
  const isReady = Boolean(displayAddress);

  const ensureEmbeddedWalletLinked = useCallback(async (): Promise<`0x${string}`> => {
    if (busyRef.current) {
      return waitForConnectedWallet(() => walletsRef.current).then(
        (w) => w.address as `0x${string}`,
      );
    }

    busyRef.current = true;
    startedAtRef.current = Date.now();
    setError(null);
    setPhase("creating");

    const slowTimer = window.setInterval(() => {
      if (
        startedAtRef.current &&
        Date.now() - startedAtRef.current >= PRIVY_SETUP_SLOW_MS
      ) {
        setPhase("slow");
      }
    }, 1000);

    try {
      let wallet = pickPrivyWallet(walletsRef.current);

      if (!wallet) {
        try {
          await createWallet();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (!walletAlreadyExistsError(msg)) throw e;
        }
        setPhase("linking");
        wallet = await waitForConnectedWallet(() => walletsRef.current);
      }

      if (!isConnected) {
        setPhase("linking");
        await setActiveWallet(wallet);
      }

      setPhase("ready");
      return wallet.address as `0x${string}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet setup failed";
      setError(msg);
      setPhase("failed");
      throw e;
    } finally {
      clearInterval(slowTimer);
      busyRef.current = false;
    }
  }, [createWallet, setActiveWallet, isConnected]);

  const restoreAttemptedRef = useRef(false);

  /** Returning session: user logged in but wallet never linked (single mount in PrivyWagmiSync only). */
  useEffect(() => {
    if (!autoRestore || !ready || !authenticated || isReady || busyRef.current) return;
    if (!walletsReady && wallets.length === 0) return;
    if (restoreAttemptedRef.current) return;

    restoreAttemptedRef.current = true;
    const tick = window.setInterval(() => {
      if (startedAtRef.current && Date.now() - startedAtRef.current > 12_000) {
        setPhase("slow");
      }
    }, 2000);

    void ensureEmbeddedWalletLinked()
      .catch(() => {
        restoreAttemptedRef.current = false;
      })
      .finally(() => clearInterval(tick));

    return () => clearInterval(tick);
  }, [
    autoRestore,
    ready,
    authenticated,
    isReady,
    walletsReady,
    wallets.length,
    ensureEmbeddedWalletLinked,
  ]);

  useEffect(() => {
    if (!authenticated) {
      startedAtRef.current = null;
      setPhase("idle");
      setError(null);
    }
  }, [authenticated]);

  return {
    ensureEmbeddedWalletLinked,
    phase,
    error,
    displayAddress,
    isReady,
    walletsReady,
  };
}

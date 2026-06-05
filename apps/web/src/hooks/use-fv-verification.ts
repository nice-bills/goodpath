"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { SupportedChains } from "@goodsdks/citizen-sdk";
import { SDK_ENV } from "@/lib/env";
import { isLocalOnlyOrigin, phoneAccessHint } from "@/lib/app-origin";
import { fvCallbackUrl } from "@/lib/fv-callback";
import { isMobileBrowser } from "@/lib/mobile-wallet";
import { useGoodIdentitySDK } from "@/hooks/use-good-sdks";
import { useWalletSession } from "@/hooks/use-wallet-session";

const POLL_MS = 4000;

export function useFvVerification({
  enabled,
  onVerified,
  returnPath = "/quests",
}: {
  enabled: boolean;
  onVerified?: () => void;
  returnPath?: string;
}) {
  const { address, status } = useWalletSession();
  const { chainId, isConnected } = useAccount();
  const hasAddress = status === "ready" && Boolean(address);
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { sdk: identitySDK, loading: sdkLoading, error: sdkError } = useGoodIdentitySDK(SDK_ENV);

  const [whitelisted, setWhitelisted] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fvQrLink, setFvQrLink] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onWrongChain =
    hasAddress && isConnected && chainId !== undefined && chainId !== celo.id;
  const mobile = isMobileBrowser();
  const showPhoneQrOption = !mobile;
  const qrBlocked = isLocalOnlyOrigin();

  const syncComplete = useCallback(async (): Promise<boolean> => {
    if (!enabled || !identitySDK || !address) return false;
    setChecking(true);
    setPollError(null);
    try {
      const { isWhitelisted } = await identitySDK.getWhitelistedRoot(address);
      setWhitelisted(isWhitelisted);
      if (isWhitelisted) {
        setFvQrLink(null);
        onVerified?.();
        return true;
      }
      return false;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verification check failed";
      setPollError(msg);
      setError(msg);
      return false;
    } finally {
      setChecking(false);
    }
  }, [enabled, identitySDK, address, onVerified]);

  useEffect(() => {
    if (!enabled || !identitySDK || !address) return;
    const id = requestAnimationFrame(() => {
      void syncComplete();
    });
    return () => cancelAnimationFrame(id);
  }, [enabled, identitySDK, address, syncComplete]);

  useEffect(() => {
    if (!fvQrLink || !enabled) return;

    const tick = () => {
      void syncComplete();
    };
    tick();
    pollRef.current = setInterval(tick, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fvQrLink, enabled, syncComplete]);

  const buildFvLink = async (): Promise<string> => {
    if (!identitySDK) throw new Error("Wallet SDK not ready");
    return identitySDK.generateFVLink(
      false,
      fvCallbackUrl(returnPath),
      SupportedChains.CELO,
    );
  };

  const handleVerifyThisDevice = async () => {
    setError(null);
    setFvQrLink(null);

    if (!address) {
      setError("Connect your wallet first.");
      return;
    }
    if (onWrongChain) {
      setError("Switch to Celo in your wallet, then try again.");
      return;
    }
    if (!identitySDK) {
      setError(sdkError ?? "Wallet SDK is still loading. Wait a moment and try again.");
      return;
    }

    setVerifying(true);
    try {
      const fvLink = await buildFvLink();
      window.location.assign(fvLink);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start verification";
      if (/reject|denied|cancel/i.test(msg)) {
        setError("Signature cancelled. Approve the message in MetaMask to continue.");
      } else {
        setError(msg);
      }
      setVerifying(false);
    }
  };

  const handleVerifyOnPhone = async () => {
    setError(null);
    setPollError(null);

    if (qrBlocked) {
      setError(phoneAccessHint());
      return;
    }

    if (!address) {
      setError("Connect your wallet on this computer first (browser extension is fine).");
      return;
    }
    if (onWrongChain) {
      setError("Switch to Celo in your wallet, then try again.");
      return;
    }
    if (!identitySDK) {
      setError(sdkError ?? "Wallet SDK is still loading. Wait a moment and try again.");
      return;
    }

    setVerifying(true);
    try {
      const fvLink = await buildFvLink();
      setFvQrLink(fvLink);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start verification";
      if (/reject|denied|cancel/i.test(msg)) {
        setError("Signature cancelled. Approve the message in MetaMask on this computer.");
      } else {
        setError(msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSwitchChain = () => {
    setError(null);
    switchChain(
      { chainId: celo.id },
      {
        onError: (e) =>
          setError(e.message ?? "Could not switch to Celo. Switch manually in MetaMask."),
      },
    );
  };

  const signLabel = verifying
    ? "Approve in wallet…"
    : sdkLoading
      ? "Connecting to GoodDollar…"
      : checking
        ? "Checking verification status…"
        : null;

  const needsVerification = enabled && whitelisted === false;

  return {
    whitelisted,
    needsVerification,
    checking,
    verifying,
    sdkLoading,
    sdkError,
    error,
    pollError,
    fvQrLink,
    showPhoneQrOption,
    qrBlocked,
    onWrongChain,
    isSwitching,
    signLabel,
    identitySDK,
    address,
    syncComplete,
    handleVerifyThisDevice,
    handleVerifyOnPhone,
    handleSwitchChain,
    closeQr: () => setFvQrLink(null),
  };
}

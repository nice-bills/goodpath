"use client";

import { phoneAccessHint } from "@/lib/app-origin";
import { PlatformGuide } from "@/components/platform-guide";
import { FvQrPanel } from "@/components/quest/fv-qr-panel";
import type { useFvVerification } from "@/hooks/use-fv-verification";

type FvFlow = ReturnType<typeof useFvVerification>;

export function FvVerificationOptions({
  flow,
  intro,
}: {
  flow: FvFlow;
  intro?: string;
}) {
  const {
    whitelisted,
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
    checking,
    syncComplete,
    handleVerifyThisDevice,
    handleVerifyOnPhone,
    handleSwitchChain,
    closeQr,
  } = flow;

  if (whitelisted) {
    return (
      <p className="mt-3 text-sm font-medium text-win">Verified — you can continue.</p>
    );
  }

  return (
    <>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {sdkLoading
          ? "Loading your wallet and GoodDollar identity tools — email sign-in can take 10–20 seconds the first time."
          : intro ??
            (showPhoneQrOption
              ? "Face verification is required. On a laptop, scan the QR to finish on your phone — often easier than this browser."
              : "Face verification is required before you can continue.")}
      </p>
      <div className="mt-3">
        <PlatformGuide variant="compact" />
      </div>

      {onWrongChain && (
        <button
          type="button"
          onClick={handleSwitchChain}
          disabled={isSwitching}
          className="btn-primary mt-4 w-full"
        >
          {isSwitching ? "Switching…" : "Switch to Celo"}
        </button>
      )}

      {showPhoneQrOption && (
        <>
          {qrBlocked && (
            <p className="mt-3 rounded-lg border border-border-strong bg-surface-muted px-3 py-2 text-xs leading-relaxed text-muted">
              {phoneAccessHint()}
            </p>
          )}
          <button
            type="button"
            onClick={handleVerifyOnPhone}
            disabled={
              qrBlocked ||
              verifying ||
              sdkLoading ||
              checking ||
              !address ||
              onWrongChain ||
              !identitySDK
            }
            className="btn-primary mt-4 w-full disabled:opacity-50"
          >
            {signLabel ?? "Verify on phone (scan QR)"}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={handleVerifyThisDevice}
        disabled={verifying || sdkLoading || checking || !address || onWrongChain || !identitySDK}
        className={
          showPhoneQrOption
            ? "btn-secondary mt-2 w-full disabled:opacity-50"
            : "btn-primary mt-4 w-full disabled:opacity-50"
        }
      >
        {signLabel ?? (showPhoneQrOption ? "Verify on this device" : "Verify me")}
      </button>

      <button
        type="button"
        onClick={() => void syncComplete()}
        disabled={checking || !identitySDK}
        className="mt-2 w-full text-center text-xs text-muted underline disabled:opacity-50"
      >
        {checking ? "Checking on-chain…" : "I already verified — refresh"}
      </button>

      {fvQrLink && (
        <FvQrPanel
          fvLink={fvQrLink}
          onClose={closeQr}
          polling={Boolean(fvQrLink && !whitelisted)}
          verified={Boolean(whitelisted)}
          pollError={pollError}
        />
      )}

      {(error || sdkError) && (
        <p className="mt-2 text-xs text-loss">{error ?? sdkError}</p>
      )}
    </>
  );
}

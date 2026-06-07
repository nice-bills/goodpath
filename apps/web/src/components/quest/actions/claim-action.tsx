"use client";

import { useCallback, useState } from "react";
import { useChainId } from "wagmi";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { isSupportedChain, chainConfigs } from "@goodsdks/citizen-sdk";
import { SDK_ENV } from "@/lib/env";
import { formatCeloAmount, MIN_CELO_FOR_TX } from "@/lib/gooddollar-gas";
import { useCeloBalance } from "@/hooks/use-celo-balance";
import { useClaimEntitlement } from "@/hooks/use-claim-entitlement";
import { useGoodClaimSDK } from "@/hooks/use-good-sdks";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { celo } from "wagmi/chains";
import type { QuestStatus } from "@/lib/api";
import { formatClaimError, formatEntitlementError } from "@/lib/quest-errors";
import { useFvVerification } from "@/hooks/use-fv-verification";
import { FvVerificationOptions } from "../fv-verification-options";
import { QuestErrorAlert } from "../quest-error-alert";
import { QuestPanel } from "../quest-panel";
import { FlexShareButton } from "@/components/flex-share-button";
import { GDollarChooser } from "@/components/g-dollar-chooser";
import { ActionImpactFeedback } from "@/components/action-impact-feedback";
import { useProfile } from "@/hooks/use-profile";
import { isDailyClaimDue } from "@/lib/daily-claim";

export function ClaimAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { address, status } = useWalletSession();
  const { data: profile } = useProfile(address);
  const chainId = useChainId();
  const markComplete = useMarkQuestComplete();
  const { sdk: claimSDK, loading, error: sdkError } = useGoodClaimSDK(SDK_ENV);
  const {
    amount: celoAmount,
    low: lowCelo,
    borderline: borderlineCelo,
    loading: celoLoading,
    walletOnCelo,
    refetch: refetchCelo,
  } = useCeloBalance();
  const entitlement = useClaimEntitlement(
    claimSDK,
    chainId,
    quest.unlocked && !loading && (!quest.completed || Boolean(profile && isDailyClaimDue(profile))),
  );
  const claimAmount = entitlement.data ?? null;
  const needsDailyReclaim = Boolean(profile && quest.completed && isDailyClaimDue(profile));
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<ReturnType<typeof formatClaimError> | null>(
    null,
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [forceFv, setForceFv] = useState(false);

  const fvFlow = useFvVerification({
    enabled: quest.unlocked && (!quest.completed || needsDailyReclaim),
    onVerified: () => {
      setForceFv(false);
      onUpdated();
    },
  });

  const onWrongChain =
    status === "ready" && chainId !== undefined && chainId !== celo.id;
  const needsFv =
    forceFv || fvFlow.needsVerification || fvFlow.whitelisted === null;

  const handleClaim = useCallback(async () => {
    if (!claimSDK || !address) return;
    setIsClaiming(true);
    setClaimError(null);
    try {
      const tx = await claimSDK.claim();
      if (tx?.transactionHash) {
        setTxHash(tx.transactionHash);
        await markComplete(address, "claim", { txHash: tx.transactionHash });
        onUpdated();
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Claim failed";
      const formatted = formatClaimError(raw);
      setClaimError(formatted);
      if (
        formatted.title === "Verify identity first" ||
        /verif|whitelist|identity|face/i.test(raw)
      ) {
        setForceFv(true);
        void fvFlow.syncComplete();
      }
    } finally {
      setIsClaiming(false);
      await refetchCelo();
    }
  }, [claimSDK, address, markComplete, onUpdated, refetchCelo, fvFlow.syncComplete]);

  const explorer =
    chainId && isSupportedChain(chainId)
      ? chainConfigs[chainId].explorer.tx
      : (h: string) => `https://celoscan.io/tx/${h}`;

  if (quest.completed && !needsDailyReclaim) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        {profile ? (
          <ActionImpactFeedback profile={profile} questId="claim" hasTx={Boolean(quest.txHash)} />
        ) : null}
        {quest.txHash && (
          <a
            href={explorer(quest.txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-xs text-accent underline"
          >
            View claim tx
          </a>
        )}
        <div className="mt-4">
          <GDollarChooser />
        </div>
        {profile ? (
          <div className="mt-4">
            <FlexShareButton
              profile={profile}
              label="Flex this claim"
              className="btn-secondary w-full"
            />
          </div>
        ) : null}
      </QuestPanel>
    );
  }

  if (!quest.unlocked) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-xs text-muted">Verify identity first.</p>
      </QuestPanel>
    );
  }

  const busy = isClaiming;

  if (needsFv && !fvFlow.whitelisted) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <FvVerificationOptions
          flow={fvFlow}
          intro="GoodDollar needs face verification before you can claim. Scan the QR to finish on your phone. Usually faster than this browser."
        />
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
      {needsDailyReclaim ? (
        <p className="mt-3 text-sm font-semibold text-accent">
          Daily reclaim — grab today&apos;s G$ to keep your streak and unlock the run.
        </p>
      ) : null}
      {onWrongChain && (
        <p className="mt-3 text-xs text-loss">
          Switch to <strong>Celo</strong> before claiming.
        </p>
      )}

      {address && !celoLoading && celoAmount !== undefined && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          <span className="font-mono text-[11px] text-foreground">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          {" · "}
          CELO on Celo:{" "}
          <span
            className={
              lowCelo
                ? "font-semibold text-loss"
                : borderlineCelo
                  ? "font-semibold text-foreground"
                  : "font-semibold text-win"
            }
          >
            {formatCeloAmount(celoAmount)}
          </span>
          {lowCelo && `. Below ~${MIN_CELO_FOR_TX} CELO; MetaMask may reject the claim.`}
          {borderlineCelo &&
            !lowCelo &&
            ". Can still be tight; MetaMask uses its own fee estimate."}
          {!walletOnCelo && ". Switch MetaMask to Celo before signing."}
        </p>
      )}

      {claimAmount !== null && claimAmount > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Claim{" "}
          <strong className="font-medium text-foreground">{claimAmount} G$</strong> on Celo. Your
          wallet will ask you to approve the transaction.
        </p>
      )}

      {needsDailyReclaim &&
        !entitlement.isLoading &&
        !loading &&
        (claimAmount === 0 || claimAmount === null) && (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Today&apos;s reclaim is due, but GoodDollar shows 0 G$ right now — the window may still
            be opening, or you already claimed on-chain today. Refresh in a minute or check
            GoodWallet.
          </p>
        )}

      <button
        type="button"
        onClick={handleClaim}
        disabled={
          busy ||
          loading ||
          entitlement.isLoading ||
          status !== "ready" ||
          !address ||
          claimAmount === 0 ||
          claimAmount === null ||
          onWrongChain
        }
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        {loading || entitlement.isLoading
          ? "Checking…"
          : isClaiming
            ? "Claiming…"
            : claimAmount && claimAmount > 0
              ? `Claim ${claimAmount} G$`
              : needsDailyReclaim
                ? "No G$ ready yet"
                : "Come back tomorrow"}
      </button>

      {txHash && (
        <a
          href={explorer(txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-xs text-accent underline"
        >
          View transaction
        </a>
      )}
      {claimError && <QuestErrorAlert error={claimError} />}

      {!claimError && sdkError && (
        <QuestErrorAlert
          error={{
            tone: "error",
            title: "Wallet not ready",
            message: sdkError,
            hint: "Reconnect your wallet on Celo, then try again.",
          }}
        />
      )}

      {!claimError && !sdkError && entitlement.error && (
        <QuestErrorAlert
          error={formatEntitlementError(
            entitlement.error instanceof Error
              ? entitlement.error.message
              : "Could not check entitlement",
          )}
        />
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Claims need about {MIN_CELO_FOR_TX}+ CELO on Celo for network fees. MetaMask uses its own
        estimate when you sign.
      </p>
    </QuestPanel>
  );
}

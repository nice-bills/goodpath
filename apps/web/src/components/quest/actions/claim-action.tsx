"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { isSupportedChain, chainConfigs } from "@goodsdks/citizen-sdk";
import { SDK_ENV } from "@/lib/env";
import {
  CELO_FAUCET_URL,
  formatCeloAmount,
  getCeloBalance,
  hasEnoughCeloForTx,
  MIN_CELO_FOR_TX,
} from "@/lib/gooddollar-gas";
import { useCeloBalance } from "@/hooks/use-celo-balance";
import { useEnsureGoodDollarGas } from "@/hooks/use-ensure-gas";
import { useClaimEntitlement } from "@/hooks/use-claim-entitlement";
import { useGoodClaimSDK } from "@/hooks/use-good-sdks";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { celo } from "wagmi/chains";
import type { QuestStatus } from "@/lib/api";
import { formatClaimError, formatEntitlementError } from "@/lib/quest-errors";
import { useFvVerification } from "@/hooks/use-fv-verification";
import { GasSponsorBanner } from "@/components/gas-sponsor-banner";
import { FvVerificationOptions } from "../fv-verification-options";
import { QuestErrorAlert } from "../quest-error-alert";
import { QuestPanel } from "../quest-panel";

export function ClaimAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { address, chainId, isConnected } = useAccount();
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
  const {
    ensureGas,
    phase: gasPhase,
    message: gasMessage,
    lastResult: gasResult,
    isEnsuring,
  } = useEnsureGoodDollarGas();
  const entitlement = useClaimEntitlement(claimSDK, chainId, quest.unlocked && !loading);
  const claimAmount = entitlement.data ?? null;
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<ReturnType<typeof formatClaimError> | null>(
    null,
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [forceFv, setForceFv] = useState(false);

  const fvFlow = useFvVerification({
    enabled: quest.unlocked && !quest.completed,
    onVerified: () => {
      setForceFv(false);
      onUpdated();
    },
  });

  const onWrongChain = isConnected && chainId !== undefined && chainId !== celo.id;
  const needsFv =
    forceFv || fvFlow.needsVerification || (fvFlow.whitelisted === null && fvFlow.checking);

  const handleClaim = useCallback(async () => {
    if (!claimSDK || !address) return;
    setIsClaiming(true);
    setClaimError(null);
    try {
      const gas = await ensureGas();
      if (!gas.ok) {
        setClaimError({
          tone: "error",
          title: "Gas not ready",
          message: gas.error,
          hint: "GoodDollar usually funds CELO within ~60 seconds. Try again or use the Celo faucet.",
        });
        return;
      }

      const liveCelo = await getCeloBalance(address);
      if (!hasEnoughCeloForTx(liveCelo)) {
        setClaimError({
          tone: "error",
          title: "Not enough CELO on Celo",
          message: `This wallet has ${formatCeloAmount(liveCelo)} CELO on Celo. MetaMask needs about ${MIN_CELO_FOR_TX}+ to sign.`,
          hint: "Use the Celo faucet or wait for GoodDollar gas, then try again.",
        });
        return;
      }

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
  }, [claimSDK, address, markComplete, onUpdated, ensureGas, refetchCelo, fvFlow.syncComplete]);

  const explorer =
    chainId && isSupportedChain(chainId)
      ? chainConfigs[chainId].explorer.tx
      : (h: string) => `https://celoscan.io/tx/${h}`;

  if (quest.completed) {
    return (
      <QuestPanel quest={quest} variant={variant}>
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

  const busy = isClaiming || isEnsuring;

  if (needsFv && !fvFlow.whitelisted) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        {fvFlow.whitelisted === null && fvFlow.checking ? (
          <p className="mt-3 text-xs text-muted">Checking identity on-chain…</p>
        ) : (
          <FvVerificationOptions
            flow={fvFlow}
            intro="GoodDollar needs face verification before you can claim. Scan the QR to finish on your phone — usually faster than this browser."
          />
        )}
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant}>
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
          {lowCelo && " — below minimum; we’ll request GoodDollar gas when you claim."}
          {borderlineCelo &&
            !lowCelo &&
            " — can still be tight; MetaMask uses its own fee estimate."}
          {!walletOnCelo && " — switch MetaMask to Celo before signing."}
        </p>
      )}

      <GasSponsorBanner
        phase={gasPhase}
        message={gasMessage}
        caution={gasResult?.ok === true && gasResult.borderline}
      />

      {claimAmount !== null && claimAmount > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          One tap: GoodDollar covers CELO if needed, then you claim{" "}
          <strong className="font-medium text-foreground">{claimAmount} G$</strong> on Celo.
        </p>
      )}

      <button
        type="button"
        onClick={handleClaim}
        disabled={
          busy ||
          loading ||
          entitlement.isLoading ||
          !address ||
          claimAmount === 0 ||
          claimAmount === null ||
          onWrongChain
        }
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        {loading || entitlement.isLoading
          ? "Checking…"
          : isEnsuring
            ? "Preparing gas…"
            : isClaiming
              ? "Claiming…"
              : claimAmount && claimAmount > 0
                ? `Claim ${claimAmount} G$`
                : "Come back tomorrow"}
      </button>

      {gasPhase === "failed" && (
        <a
          href={CELO_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-2 flex w-full items-center justify-center text-xs"
        >
          Get CELO from Celo faucet (fallback)
        </a>
      )}

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
        Claims need about {MIN_CELO_FOR_TX}+ CELO on Celo for network fees. The app reads your
        on-chain balance; MetaMask shows its own estimate when you sign. GoodDollar can fund gas
        automatically — same as GoodWallet.
      </p>
    </QuestPanel>
  );
}

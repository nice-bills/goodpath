"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { SupportedChains, CHAIN_DECIMALS } from "@goodsdks/citizen-sdk";
import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  isConfiguredEthAddress,
} from "@goodpath/shared";
import { CELO_FAUCET_URL } from "@/lib/gooddollar-gas";
import { waitForCeloTxReceipt } from "@/lib/celo-public-client";
import { gDollarAddress } from "@/lib/gd-contracts";
import {
  MIN_DEPLOY_G,
  MIN_STREAM_G_PER_MONTH,
  SDK_ENV,
  STREAM_RECIPIENT,
} from "@/lib/env";
import {
  CFA_FORWARDER_ABI,
  CFA_FORWARDER_ADDRESS,
  gPerMonthToFlowRate,
} from "@/lib/superfluid";
import { usePrepareCeloTx } from "@/hooks/use-prepare-celo-tx";
import { useMarkQuestComplete } from "@/hooks/use-quest-actions";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useGoodSavingsSDK } from "@/hooks/use-good-savings";
import type { QuestStatus } from "@/lib/api";
import { formatTipError } from "@/lib/quest-errors";
import { GasSponsorBanner } from "@/components/gas-sponsor-banner";
import { ActionImpactFeedback } from "@/components/action-impact-feedback";
import { useProfile } from "@/hooks/use-profile";
import { QuestErrorAlert } from "../quest-error-alert";
import { QuestPanel } from "../quest-panel";

type DeployMode = "save" | "stream";

export function DeployAction({
  quest,
  onUpdated,
  variant = "standalone",
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  variant?: "standalone" | "embedded";
}) {
  const { status, address } = useWalletSession();
  const { data: profile } = useProfile(address);
  const { sdk, loading: sdkLoading, error: sdkError } = useGoodSavingsSDK();
  const markComplete = useMarkQuestComplete();
  const { prepare, phase: gasPhase, message: gasMessage, isEnsuring } =
    usePrepareCeloTx();
  const { writeContract, isPending: streamPending } = useWriteContract();

  const [mode, setMode] = useState<DeployMode>("save");
  const [deployError, setDeployError] = useState<ReturnType<
    typeof formatTipError
  > | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const token = gDollarAddress();
  const streamReady = isConfiguredEthAddress(STREAM_RECIPIENT);

  const stakeAndComplete = async () => {
    if (!address || !sdk) return;
    if (SDK_ENV !== "production") {
      setDeployError(
        formatTipError(
          "Save + stream are verified on Celo mainnet. Set NEXT_PUBLIC_GOODDOLLAR_ENV=production.",
        ),
      );
      return;
    }
    setDeployError(null);
    setBusy(true);
    try {
      const ready = await prepare();
      if (!ready.ok) {
        setDeployError(formatTipError(ready.error));
        return;
      }
      const decimals = CHAIN_DECIMALS[SupportedChains.CELO];
      const amount = parseUnits(MIN_DEPLOY_G, decimals);
      let hash: `0x${string}` | undefined;
      const receipt = await sdk.stake(amount, (h) => {
        hash = h;
        setTxHash(h);
      });
      const finalHash = hash ?? receipt.transactionHash;
      if (!quest.completed) {
        await markComplete(address, "deploy", {
          txHash: finalHash,
          meta: DEPLOY_SAVE_META,
        });
        onUpdated();
      }
    } catch (e) {
      setDeployError(
        formatTipError(e instanceof Error ? e.message : "Stake failed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const startStream = async () => {
    if (!address) return;
    if (!token) {
      setDeployError(formatTipError("G$ contract not configured"));
      return;
    }
    if (!streamReady) {
      setDeployError(
        formatTipError("Set NEXT_PUBLIC_STREAM_RECIPIENT (or TIP_RECIPIENT)"),
      );
      return;
    }
    if (SDK_ENV !== "production") {
      setDeployError(
        formatTipError(
          "Superfluid G$ streams are on Celo mainnet (production env).",
        ),
      );
      return;
    }
    setDeployError(null);
    const ready = await prepare();
    if (!ready.ok) {
      setDeployError(formatTipError(ready.error));
      return;
    }
    const flowRate = gPerMonthToFlowRate(MIN_STREAM_G_PER_MONTH);
    writeContract(
      {
        address: CFA_FORWARDER_ADDRESS,
        abi: CFA_FORWARDER_ABI,
        functionName: "createFlow",
        args: [token, address, STREAM_RECIPIENT, flowRate, "0x"],
      },
      {
        onSuccess: async (hash) => {
          setTxHash(hash);
          if (quest.completed) return;
          try {
            const receipt = await waitForCeloTxReceipt(hash);
            if (receipt.status !== "success") {
              throw new Error("Transaction failed on Celo");
            }
            await markComplete(address, "deploy", {
              txHash: hash,
              meta: DEPLOY_STREAM_META,
            });
            onUpdated();
          } catch (e) {
            setDeployError(
              formatTipError(
                e instanceof Error ? e.message : "Server rejected stream proof",
              ),
            );
          }
        },
        onError: (e) => setDeployError(formatTipError(e.message)),
      },
    );
  };

  const displayHash = txHash ?? quest.txHash;
  const working = busy || isEnsuring || sdkLoading || streamPending;
  const walletReady = status === "ready" && Boolean(address);

  if (quest.completed) {
    const deployMeta = profile?.completions.deploy?.meta;
    return (
      <QuestPanel quest={quest} variant={variant}>
        {profile ? (
          <ActionImpactFeedback
            profile={profile}
            questId="deploy"
            meta={deployMeta}
            hasTx={Boolean(displayHash)}
          />
        ) : null}
        {displayHash && (
          <a
            href={`https://celoscan.io/tx/${displayHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-xs text-accent underline"
          >
            View deploy tx on Celoscan
          </a>
        )}
      </QuestPanel>
    );
  }

  if (!quest.unlocked) {
    return (
      <QuestPanel quest={quest} variant={variant}>
        <p className="mt-3 text-xs text-muted">
          Verify your identity first, then put idle G$ to work.
        </p>
      </QuestPanel>
    );
  }

  return (
    <QuestPanel quest={quest} variant={variant} className="quest-active-panel">
      <p className="mt-2 text-xs text-muted">
        Save your G$ or stream it — streaming is the highest-status move.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("save")}
          className={`flex-1 rounded-lg border-2 px-2 py-2 text-xs font-semibold ${
            mode === "save"
              ? "border-foreground bg-foreground text-background"
              : "border-border-strong bg-surface"
          }`}
        >
          Save your G$
        </button>
        <button
          type="button"
          onClick={() => setMode("stream")}
          className={`flex-1 rounded-lg border-2 px-2 py-2 text-xs font-semibold ${
            mode === "stream"
              ? "border-foreground bg-foreground text-background"
              : "border-border-strong bg-surface"
          }`}
        >
          Stream G$
        </button>
      </div>
      <GasSponsorBanner phase={gasPhase} message={gasMessage} />
      {mode === "save" ? (
        <button
          type="button"
          onClick={stakeAndComplete}
          disabled={working || !walletReady || !sdk}
          className="btn-primary mt-4 w-full disabled:opacity-50"
        >
          {isEnsuring
            ? "Preparing gas…"
            : busy
              ? "Staking G$…"
              : sdkLoading
                ? "Loading savings SDK…"
                : `Stake ${MIN_DEPLOY_G} G$ (savings-sdk)`}
        </button>
      ) : (
        <>
          <p className="mt-2 text-[10px] text-muted">
            Superfluid CFA forwarder · ~{MIN_STREAM_G_PER_MONTH} G$/month to league
            jar
          </p>
          <button
            type="button"
            onClick={startStream}
            disabled={working || !walletReady || streamPending}
            className="btn-primary mt-3 w-full disabled:opacity-50"
          >
            {streamPending
              ? "Opening stream…"
              : `Stream ${MIN_STREAM_G_PER_MONTH} G$/mo`}
          </button>
        </>
      )}
      {gasPhase === "failed" && (
        <a
          href={CELO_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-2 flex w-full items-center justify-center text-xs"
        >
          Celo faucet (fallback)
        </a>
      )}
      {displayHash && (
        <a
          href={`https://celoscan.io/tx/${displayHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-xs text-accent underline"
        >
          View transaction
        </a>
      )}
      {(deployError || sdkError) && (
        <QuestErrorAlert error={deployError ?? formatTipError(sdkError ?? "")} />
      )}
    </QuestPanel>
  );
}

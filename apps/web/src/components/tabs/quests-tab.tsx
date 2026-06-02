"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { QuestReceiptStub } from "@/components/quest-receipt-stub";
import { ConnectButton } from "@/components/connect-button";
import { HomeSkeleton } from "@/components/ui/skeleton";
import { FvReturnBanner } from "@/components/quest/fv-return-banner";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";

const QuestStickerGrid = dynamic(
  () =>
    import("@/components/quest-sticker-grid").then((m) => ({
      default: m.QuestStickerGrid,
    })),
  { loading: () => <HomeSkeleton /> },
);

export function QuestsTab() {
  const { status: walletStatus, address: walletAddress } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile, refetch, isLoading, isFetching } = useProfile(walletAddress);
  const showPath = demoActive || walletStatus === "ready";
  const progress = profile?.progress ?? 0;
  const pathDone = Boolean(profile?.pathCompletedAt);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        eyebrow={`${progress}%`}
        title="Quests"
        subtitle="Tap a sticker — finish the active step below."
      />

      <DemoModeBanner />

      <Suspense fallback={null}>
        <FvReturnBanner />
      </Suspense>

      {!showPath ? (
        <div className="card flex flex-1 flex-col items-center justify-center p-8 text-center">
          {walletStatus === "linking" ? (
            <>
              <p className="text-sm font-medium text-foreground">Setting up your wallet…</p>
              <p className="mt-2 text-xs text-muted">Almost ready — keep this tab open.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Connect a wallet on Celo or try demo mode.</p>
              <div className="mt-6 w-full max-w-[260px]">
                <ConnectButton variant="pill" />
              </div>
            </>
          )}
        </div>
      ) : isLoading && !profile ? (
        <HomeSkeleton />
      ) : (
        <>
          {isFetching && profile ? (
            <p className="mb-2 text-center text-[10px] text-muted" aria-live="polite">
              Syncing…
            </p>
          ) : null}
          <QuestStickerGrid
            quests={profile?.quests ?? []}
            onUpdated={() => void refetch()}
          />

          {pathDone && profile ? <QuestReceiptStub profile={profile} /> : null}
        </>
      )}
    </main>
  );
}

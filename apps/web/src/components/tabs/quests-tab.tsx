"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { QuestReceiptStub } from "@/components/quest-receipt-stub";
import { HomeSkeleton } from "@/components/ui/skeleton";
import { FvReturnBanner } from "@/components/quest/fv-return-banner";
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
        eyebrow={pathDone ? "Path done" : `${progress}%`}
        title="Your path"
        subtitle="Tap a quest. Claim daily G$ before the board cools."
        showConnect
      />


      <Suspense fallback={null}>
        <FvReturnBanner />
      </Suspense>

      {!showPath ? (
        <div className="card flex flex-1 flex-col items-center justify-center p-8 text-center">
          {walletStatus === "linking" ? (
            <>
              <p className="text-sm font-medium text-foreground">Setting up your wallet…</p>
              <p className="mt-2 text-xs text-muted">Almost ready. Keep this tab open.</p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Connect your wallet on Home to start quests.
            </p>
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
            profile={profile}
            onUpdated={() => void refetch()}
          />

          {pathDone && profile ? <QuestReceiptStub profile={profile} /> : null}
        </>
      )}
    </main>
  );
}

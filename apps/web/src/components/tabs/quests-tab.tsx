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
import { useAppTab } from "@/hooks/use-app-tab";
import { useClaimAvailability } from "@/hooks/use-claim-availability";
import { TodaysRunCard } from "@/components/todays-run-card";
import { QuestAction } from "@/components/quest/quest-action";
import { TabLink } from "@/components/tab-link";

const QuestStickerGrid = dynamic(
  () =>
    import("@/components/quest-sticker-grid").then((m) => ({
      default: m.QuestStickerGrid,
    })),
  { loading: () => <HomeSkeleton /> },
);

export function QuestsTab() {
  const { questNavFocus } = useAppTab();
  const { status: walletStatus, address: walletAddress } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile, refetch, isLoading, isFetching } = useProfile(walletAddress);
  const showPath = demoActive || walletStatus === "ready";
  const progress = profile?.progress ?? 0;
  const pathDone = Boolean(profile?.pathCompletedAt);
  const claimFocus = questNavFocus === "claim";
  const claimQuest = profile?.quests.find((q) => q.id === "claim");
  const { canClaimNow, claimBlocked } = useClaimAvailability(profile);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        eyebrow={
          claimFocus
            ? canClaimNow
              ? "Reclaim due"
              : claimBlocked
                ? "On-chain done"
                : "Daily run"
            : pathDone
              ? "Path done"
              : `${progress}%`
        }
        title={claimFocus ? "Claim & bet" : "Your path"}
        subtitle={
          claimFocus
            ? "Claim today's G$, lock your move, then deliver it on-chain."
            : "Tap a quest. Claim daily G$ before the board cools."
        }
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
      ) : claimFocus && profile ? (
        <>
          {isFetching ? (
            <p className="mb-2 text-center text-[10px] text-muted" aria-live="polite">
              Syncing…
            </p>
          ) : null}
          <div className="flex flex-col gap-4 px-4 pb-6">
            <TodaysRunCard profile={profile} />
            {claimQuest ? (
              <div className="card p-4">
                <QuestAction quest={claimQuest} onUpdated={() => void refetch()} />
              </div>
            ) : null}
            <p className="text-center text-xs text-muted">
              Full onboarding path?{" "}
              <TabLink tab="quests" className="vibe-link-all">
                Open path board
              </TabLink>
            </p>
          </div>
        </>
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

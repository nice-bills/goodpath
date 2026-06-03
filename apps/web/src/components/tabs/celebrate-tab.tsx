"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Trophy, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { ProgressRing } from "@/components/progress-ring";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { TodaysHabit } from "@/components/todays-habit";
import { appTabHref } from "@/lib/app-tab";

const ConfettiBurst = dynamic(
  () => import("@/components/ui/confetti").then((m) => ({ default: m.ConfettiBurst })),
  { ssr: false },
);

const PathReceipt = dynamic(
  () => import("@/components/path-receipt").then((m) => ({ default: m.PathReceipt })),
  { loading: () => <div className="card h-48 animate-pulse bg-surface-muted" /> },
);

export function CelebrateTab() {
  const { status: walletStatus, address: walletAddress } = useWalletSession();
  const { active: demoActive } = useDemoMode();
  const { data: profile } = useProfile(walletAddress);
  const complete = Boolean(profile?.pathCompletedAt);
  const progress = profile?.progress ?? 0;
  const showContent = demoActive || walletStatus === "ready";

  return (
    <main className="relative flex flex-1 flex-col">
      {complete ? <ConfettiBurst /> : null}

      <div className="absolute left-0 right-0 top-0 flex items-center justify-between">
        <Link
          href={appTabHref("home")}
          scroll={false}
          className="text-xs font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" weight="bold" aria-hidden />
          Back
        </Link>
      </div>

      <DemoModeBanner />

      {!showContent ? (
        <div className="card mt-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          {walletStatus === "linking" ? (
            <>
              <p className="text-sm font-medium text-foreground">Setting up your wallet…</p>
              <p className="mt-2 text-xs text-muted">
                Privy is creating your Celo wallet. This can take up to 90 seconds on first login.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Connect your wallet on Home to unlock Done.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-1 flex-col gap-6 pb-4">
          <div className="text-center">
            {complete ? (
              <Trophy className="mx-auto h-12 w-12 text-accent" weight="fill" aria-hidden />
            ) : null}
            <div className="mt-4 flex justify-center">
              <ProgressRing progress={progress} />
            </div>
            <h1 className="font-display mt-6 text-3xl leading-tight">
              {complete ? "Path complete" : progress > 0 ? "Almost there" : "Finish the path"}
            </h1>
            <p className="mt-3 text-sm text-muted">
              {complete
                ? "You onboarded into GoodDollar — verified, claiming, transacting, supporting."
                : `${progress}% done. Complete all five quests for your receipt.`}
            </p>
            {profile ? (
              <p className="mt-2 font-mono text-sm text-muted">
                {profile.streak} day streak
              </p>
            ) : null}
          </div>

          {complete && profile ? (
            <>
              <PathReceipt profile={profile} demo={demoActive} />
              <TodaysHabit streak={profile.streak} />
            </>
          ) : (
            <p className="text-center text-xs text-muted">
              Your shareable Path Receipt unlocks at 100%.
            </p>
          )}

          <Link
            href={complete ? appTabHref("home") : appTabHref("quests")}
            scroll={false}
            className="btn-primary group mx-auto w-full max-w-[320px]"
          >
            {complete ? "Home" : "Continue quests"}
            <span className="btn-icon-wrap">
              <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}

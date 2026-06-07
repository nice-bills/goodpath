"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Trophy, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { ProgressRing } from "@/components/progress-ring";
import { TodaysHabit } from "@/components/todays-habit";
import { FlexShareButton } from "@/components/flex-share-button";
import { TesterFeedbackBanner } from "@/components/tester-feedback-banner";
import { appTabHref } from "@/lib/app-tab";
import { fadeUp } from "@/lib/motion";

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
          className="inline-flex min-h-[44px] items-center text-xs font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" weight="bold" aria-hidden />
          Back to run
        </Link>
      </div>


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
              Connect your wallet on Run to unlock your receipt.
            </p>
          )}
        </div>
      ) : (
        <motion.div
          {...fadeUp}
          className="mt-8 flex flex-1 flex-col gap-6 pb-4"
        >
          <div className="text-center">
            {complete ? (
              <Trophy className="mx-auto h-12 w-12 text-accent" weight="fill" aria-hidden />
            ) : null}
            <div className="mt-4 flex justify-center">
              <ProgressRing progress={progress} />
            </div>
            <h1 className="font-display mt-6 text-3xl leading-tight text-balance">
              {complete ? "Path receipt" : progress > 0 ? "Keep climbing" : "Start your run"}
            </h1>
            <p className="mt-3 text-sm text-pretty text-muted">
              {complete
                ? "Your scorecard is ready: G$ moved, division, and Celoscan proofs. Share it."
                : `${progress}% of the core path. Finish quests to unlock your receipt.`}
            </p>
            {profile ? (
              <p className="mt-2 font-mono text-sm tabular-nums text-muted">
                {profile.streak} day streak
              </p>
            ) : null}
          </div>

          {complete && profile ? (
            <>
              <FlexShareButton profile={profile} className="btn-primary mx-auto w-full max-w-[320px]" />
              <PathReceipt profile={profile} demo={demoActive} />
              <TodaysHabit profile={profile} streak={profile.streak} />
              <TesterFeedbackBanner surface="celebrate" />
            </>
          ) : profile?.league?.promoted ? (
            <>
              <p className="text-center text-sm font-semibold text-foreground">
                Top of {profile.league.divisionLabel} this week. Share the climb.
              </p>
              <FlexShareButton
                profile={profile}
                label="Flex rank-up"
                className="btn-primary mx-auto w-full max-w-[320px]"
              />
            </>
          ) : profile && progress >= 50 ? (
            <FlexShareButton
              profile={profile}
              label="Flex progress"
              className="btn-secondary mx-auto w-full max-w-[320px]"
            />
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
            {complete ? "Back to run" : "Continue quests"}
            <span className="btn-icon-wrap">
              <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
            </span>
          </Link>
        </motion.div>
      )}
    </main>
  );
}

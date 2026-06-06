"use client";

import { Compass, Fire, Trophy } from "@phosphor-icons/react";
import { LogoLockup } from "@/components/brand/logo-mark";
import { ConnectButton } from "@/components/connect-button";
import { ClaimCountdownStrip } from "@/components/vibe/claim-countdown-strip";
import { RunPulseFeed } from "@/components/vibe/run-pulse-feed";
import { useExploreFlexes, useExploreLeaderboard } from "@/hooks/use-explore-board";
import { usePublicWeeklyRuns } from "@/hooks/use-weekly-run";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useProfile } from "@/hooks/use-profile";
import { formatCount, formatPoints, formatRelativeTime } from "@/lib/format";

function FlexCard({
  handle,
  headline,
  kind,
  when,
  hasProof,
  isSeeded = false,
}: {
  handle: string;
  headline: string;
  kind: string;
  when: string;
  hasProof: boolean;
  isSeeded?: boolean;
}) {
  return (
    <li className="explore-flex-card">
      <div className="explore-flex-top">
        <span className="explore-flex-avatar font-mono">{handle.slice(0, 2)}</span>
        <div className="explore-flex-badges">
          {kind === "path_complete" ? (
            <span className="explore-flex-badge explore-flex-badge-gold">Path flex</span>
          ) : (
            <span className="explore-flex-badge">Flex</span>
          )}
          {isSeeded ? (
            <span className="explore-flex-badge explore-flex-badge-bench">Bench</span>
          ) : null}
        </div>
      </div>
      <p className="explore-flex-handle font-mono">{handle}</p>
      <p className="explore-flex-headline">{headline}</p>
      <p className="explore-flex-meta">
        {formatRelativeTime(when)}
        {hasProof ? " · on-chain" : ""}
      </p>
    </li>
  );
}

function LeaderboardRow({
  rank,
  handle,
  points,
  divisionLabel,
  displayLabel,
  isSeeded,
  isViewer,
}: {
  rank: number;
  handle: string;
  points: number;
  divisionLabel: string;
  displayLabel?: string;
  isSeeded: boolean;
  isViewer: boolean;
}) {
  const name = isSeeded ? handle : (displayLabel ?? handle);
  return (
    <li className={`explore-leader-row ${isViewer ? "explore-leader-row-you" : ""}`}>
      <span className="explore-leader-rank font-mono">#{rank}</span>
      <div className="explore-leader-main min-w-0">
        <p className="explore-leader-name">
          {isViewer ? "You" : name}
          {isSeeded ? <span className="explore-leader-seed"> · bench</span> : null}
        </p>
        <p className="explore-leader-meta">{divisionLabel}</p>
      </div>
      <span className="explore-leader-pts font-mono">{formatPoints(points)}</span>
    </li>
  );
}

export function ExploreTab() {
  const { address, status } = useWalletSession();
  const hasWallet = status === "ready" && Boolean(address);
  const { data: profile } = useProfile(address);
  const { rows, periodId, isLoading: boardLoading, live } = useExploreLeaderboard(address);
  const { flexes, isLoading: flexLoading } = useExploreFlexes();
  const { runs, isLoading: runsLoading } = usePublicWeeklyRuns(10);

  return (
    <main className="explore-page">
      <header className="explore-head">
        <div className="vibe-top-bar vibe-top-bar-connected">
          <LogoLockup size="nav" className="vibe-top-bar-brand" />
          <span className="flex-1" aria-hidden />
          {hasWallet ? <ConnectButton variant="pill" /> : null}
        </div>
        <div className="explore-hero">
          <span className="explore-hero-badge">
            <Compass className="h-3.5 w-3.5" weight="fill" aria-hidden />
            Explore
          </span>
          <h1 className="font-display explore-title">Who&apos;s heating up this week</h1>
          <p className="explore-lead">
            Real runs, real flexes, real division ranks. No bots, no filler names.
          </p>
        </div>
      </header>

      <ClaimCountdownStrip profile={profile} />

      <section className="explore-section" aria-labelledby="explore-live-title">
        <div className="explore-section-head">
          <h2 id="explore-live-title" className="explore-section-title">
            Live moves <span aria-hidden>⚡</span>
          </h2>
        </div>
        <RunPulseFeed subtitle="Quest completions from connected wallets." />
      </section>

      <section className="explore-section" aria-labelledby="explore-flex-title">
        <div className="explore-section-head">
          <h2 id="explore-flex-title" className="explore-section-title">
            <Trophy className="inline h-5 w-5 -translate-y-px" weight="duotone" aria-hidden /> Recent
            flexes
          </h2>
          <p className="explore-section-sub">Paths crushed, claims, tips, deploys.</p>
        </div>
        {flexLoading ? (
          <ul className="explore-flex-track" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="explore-flex-card explore-flex-skeleton" />
            ))}
          </ul>
        ) : flexes.length > 0 ? (
          <ul className="explore-flex-track" aria-label="Recent flex moments">
            {flexes.map((f) => (
              <FlexCard
                key={f.id}
                handle={f.handle}
                headline={f.headline}
                kind={f.kind}
                when={f.completedAt}
                hasProof={f.hasProof}
                isSeeded={f.isSeeded}
              />
            ))}
          </ul>
        ) : (
          <p className="explore-empty">
            {live
              ? "No flexes yet. Be first to claim, tip, or finish the path."
              : "Connect Convex to see real flexes from the board."}
          </p>
        )}
      </section>

      <section className="explore-section" aria-labelledby="explore-runs-title">
        <div className="explore-section-head">
          <h2 id="explore-runs-title" className="explore-section-title">
            <Fire className="inline h-5 w-5 -translate-y-px" weight="fill" aria-hidden /> Public
            runs
          </h2>
          <p className="explore-section-sub">Weekly goals players chose to share.</p>
        </div>
        {runsLoading ? (
          <ul className="explore-flex-track" aria-busy="true">
            {[0, 1].map((i) => (
              <li key={i} className="explore-flex-card explore-flex-skeleton" />
            ))}
          </ul>
        ) : runs.length > 0 ? (
          <ul className="explore-runs-list">
            {runs.map((r) => (
              <li key={r.id} className="explore-run-row">
                <span className="explore-run-handle font-mono">{r.handle}</span>
                <span className="explore-run-title">{r.title}</span>
                <span className="explore-run-when">{formatRelativeTime(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="explore-empty">
            No public runs posted yet. Set yours on Run after you connect.
          </p>
        )}
      </section>

      <section className="explore-section explore-section-board" aria-labelledby="explore-board-title">
        <div className="explore-section-head">
          <h2 id="explore-board-title" className="explore-section-title">
            Division leaderboard
          </h2>
          <p className="explore-section-sub">
            {periodId} · {formatCount(rows.length)} on the board
          </p>
        </div>
        {boardLoading ? (
          <ul className="explore-leader-list" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="explore-leader-row explore-leader-skeleton" />
            ))}
          </ul>
        ) : rows.length > 0 ? (
          <ul className="explore-leader-list" aria-label="Weekly division leaderboard">
            {rows.map((row) => (
              <LeaderboardRow
                key={row.id}
                rank={row.rank}
                handle={row.handle}
                points={row.points}
                divisionLabel={row.divisionLabel}
                displayLabel={row.displayLabel}
                isSeeded={row.isSeeded}
                isViewer={Boolean(address && row.address === address.toLowerCase())}
              />
            ))}
          </ul>
        ) : (
          <p className="explore-empty">
            Board is empty. Run{" "}
            <code className="rounded bg-surface-muted px-1 text-xs">npx convex run seed:divisionRunners</code>{" "}
            for demo benchmarks, or connect and claim to appear.
          </p>
        )}
      </section>
    </main>
  );
}

"use client";

import { useRecentRuns } from "@/hooks/use-recent-runs";
import { useImpactStats } from "@/hooks/use-impact-stats";
import { formatCount, formatRelativeTime } from "@/lib/format";

function LiveEventCard({
  handle,
  verb,
  when,
  hasProof,
}: {
  handle: string;
  verb: string;
  when: string;
  hasProof: boolean;
}) {
  return (
    <li className="vibe-story-card vibe-story-card-live">
      <div className="vibe-story-top">
        <span className="vibe-story-avatar font-mono text-[11px]" aria-hidden>
          {handle.slice(0, 2)}
        </span>
        {hasProof ? <span className="vibe-story-proof">On-chain</span> : null}
      </div>
      <p className="vibe-story-name font-mono">{handle}</p>
      <p className="vibe-story-action">{verb}</p>
      <p className="vibe-story-pts">{when}</p>
    </li>
  );
}

function PulseStats() {
  const { data, isLoading } = useImpactStats();
  if (isLoading) {
    return (
      <div className="vibe-pulse-stats" aria-busy>
        <span>—</span>
        <span>—</span>
        <span>—</span>
      </div>
    );
  }
  return (
    <dl className="vibe-pulse-stats">
      <div>
        <dt>Wallets on path</dt>
        <dd>{formatCount(data?.walletsOnPath)}</dd>
      </div>
      <div>
        <dt>Quest moves</dt>
        <dd>{formatCount(data?.questCompletions)}</dd>
      </div>
      <div>
        <dt>On-chain proofs</dt>
        <dd>{formatCount(data?.chainProofCount)}</dd>
      </div>
    </dl>
  );
}

export function RunPulseFeed({ subtitle }: { subtitle?: string }) {
  const { events, last24hCount, isLoading, live } = useRecentRuns();
  const hasEvents = events.length > 0;

  const title = hasEvents ? "Live on Celo" : "The board is open";
  const sub =
    subtitle ??
    (hasEvents
      ? last24hCount > 0
        ? `${formatCount(last24hCount)} move${last24hCount === 1 ? "" : "s"} in the last 24h — real wallets, no bots.`
        : "Real quest completions from GoodPath."
      : live
        ? "No moves yet. Connect and claim — you can be first on the board."
        : "Turn on Convex to see live runs, or connect and start the board.");

  return (
    <section className="vibe-feed" aria-labelledby="vibe-feed-title">
      <div className="vibe-feed-head">
        <h2 id="vibe-feed-title" className="vibe-feed-title">
          {title} {hasEvents ? <span aria-hidden>🔥</span> : <span aria-hidden>⚡</span>}
        </h2>
        <p className="vibe-feed-sub">{sub}</p>
      </div>

      {isLoading ? (
        <ul className="vibe-feed-track" aria-label="Loading live runs">
          {[0, 1, 2].map((i) => (
            <li key={i} className="vibe-story-card vibe-story-skeleton" aria-hidden />
          ))}
        </ul>
      ) : hasEvents ? (
        <ul
          className="vibe-feed-track"
          aria-label="Live runs — scroll sideways for more"
        >
          {events.map((e) => (
            <LiveEventCard
              key={e.id}
              handle={e.handle}
              verb={e.verb}
              when={formatRelativeTime(e.completedAt)}
              hasProof={e.hasProof}
            />
          ))}
        </ul>
      ) : (
        <div className="vibe-empty-board">
          <p className="vibe-empty-hook">
            First claim sets the tone. Miss today and someone else owns the streak energy.
          </p>
          <PulseStats />
        </div>
      )}
    </section>
  );
}

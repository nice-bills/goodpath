"use client";

import { usePublicWeeklyRuns } from "@/hooks/use-weekly-run";
import { formatRelativeTime } from "@/lib/format";

function GoalCard({
  handle,
  title,
  when,
}: {
  handle: string;
  title: string;
  when: string;
}) {
  return (
    <li className="vibe-story-card vibe-story-card-goal">
      <div className="vibe-story-top">
        <span className="vibe-story-avatar font-mono text-[11px]" aria-hidden>
          {handle.slice(0, 2)}
        </span>
        <span className="vibe-story-hot">Heating up</span>
      </div>
      <p className="vibe-story-name font-mono">{handle}</p>
      <p className="vibe-story-action">{title}</p>
      <p className="vibe-story-pts">{when}</p>
    </li>
  );
}

export function RunsHeatingUp() {
  const { runs, isLoading, live } = usePublicWeeklyRuns();

  if (!live) return null;

  if (isLoading) {
    return (
      <section className="vibe-feed vibe-feed-goals" aria-labelledby="runs-heating-title">
        <h2 id="runs-heating-title" className="vibe-feed-title">
          Runs heating up <span aria-hidden>🔥</span>
        </h2>
        <ul className="vibe-feed-track" aria-busy="true">
          {[0, 1].map((i) => (
            <li key={i} className="vibe-story-card vibe-story-skeleton" aria-hidden />
          ))}
        </ul>
      </section>
    );
  }

  if (runs.length === 0) return null;

  return (
    <section className="vibe-feed vibe-feed-goals" aria-labelledby="runs-heating-title">
      <div className="vibe-feed-head">
        <h2 id="runs-heating-title" className="vibe-feed-title">
          Runs heating up <span aria-hidden>🔥</span>
        </h2>
        <p className="vibe-feed-sub">
          Real weekly goals from connected wallets — no bots, no filler names.
        </p>
      </div>
      <ul className="vibe-feed-track" aria-label="Public weekly run goals">
        {runs.map((r) => (
          <GoalCard
            key={r.id}
            handle={r.handle}
            title={r.title}
            when={formatRelativeTime(r.createdAt)}
          />
        ))}
      </ul>
    </section>
  );
}

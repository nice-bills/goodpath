"use client";

import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved, formatPoints } from "@/lib/format";
import { celoscanContractUrl } from "@/lib/gd-contracts";
import { RECEIPT_CONTRACT_ADDRESS } from "@/lib/env";

export function RunHeroCard({ profile }: { profile: ProfileResponse }) {
  const { league } = profile;
  if (!league) return null;

  const gMoved = formatGsMoved(league.gMovedWei);
  const rankInDivision =
    league.divisionRank != null && league.divisionSize
      ? `#${league.divisionRank} / ${league.divisionSize}`
      : "—";

  const above = league.personAbove;
  const rival = league.rival;

  return (
    <section className="run-hero-card card card-active" aria-label="Your weekly run">
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
          This week · {league.periodId}
        </p>
        <h2 className="mt-1 font-display text-2xl leading-tight text-balance">
          {league.divisionLabel ?? "Bronze"} division
        </h2>

        <dl className="run-pulse-stats">
          <div className="run-pulse-stat">
            <dt>G$ moved</dt>
            <dd>{gMoved}</dd>
          </div>
          <div className="run-pulse-stat">
            <dt>League pts</dt>
            <dd>{formatPoints(league.points)}</dd>
          </div>
          <div className="run-pulse-stat">
            <dt>In division</dt>
            <dd className="text-lg">{rankInDivision}</dd>
          </div>
          <div className="run-pulse-stat">
            <dt>Global</dt>
            <dd className="text-lg">
              {league.rank != null ? `#${league.rank}` : "—"}
            </dd>
          </div>
        </dl>

        {league.nextMove ? (
          <p className="run-next-move mt-3 px-3 py-2.5 text-sm font-semibold leading-snug text-foreground">
            <span className="text-muted-dim">Next move · </span>
            {league.nextMove}
          </p>
        ) : null}

        {above ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-foreground">{above.label}</span> is{" "}
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {above.gap}
            </span>{" "}
            pt{above.gap === 1 ? "" : "s"} ahead
          </p>
        ) : null}
        {rival ? (
          <p className="mt-1 text-xs text-muted">
            Rival:{" "}
            <span className="font-semibold text-foreground">
              {rival.label ?? "Weekly rival"}
            </span>
            {rival.isSeeded ? " (benchmark)" : ""}
          </p>
        ) : null}

        {RECEIPT_CONTRACT_ADDRESS ? (
          <p className="mt-3 text-[10px] text-muted-dim">
            Receipt contract ·{" "}
            <a
              href={celoscanContractUrl(RECEIPT_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              Celoscan
            </a>
          </p>
        ) : (
          <p className="mt-3 text-[10px] text-muted-dim">
            Proofs from your quest txs on Celoscan
          </p>
        )}
      </div>
    </section>
  );
}

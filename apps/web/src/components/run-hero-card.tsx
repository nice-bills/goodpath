"use client";

import type { ProfileResponse } from "@/lib/api";
import { formatGsMoved } from "@/lib/format";
import { celoscanContractUrl } from "@/lib/gd-contracts";
import { RECEIPT_CONTRACT_ADDRESS } from "@/lib/env";

export function RunHeroCard({ profile }: { profile: ProfileResponse }) {
  const { league } = profile;
  if (!league) return null;

  const gMoved = formatGsMoved(league.gMovedWei);
  const rankInDivision =
    league.divisionRank != null && league.divisionSize
      ? `#${league.divisionRank} of ${league.divisionSize}`
      : null;

  return (
    <section className="passport-hero run-hero-card mb-0" aria-label="Your weekly run">
      <div className="passport-paper py-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted">
          GoodPath run · {league.periodId}
        </span>
        <h2 className="mt-1 font-display text-3xl leading-none">
          {league.divisionLabel ?? "Bronze"} division
        </h2>
        <p className="mt-2 text-sm text-muted">
          <span className="font-mono tabular-nums text-foreground">{gMoved}</span> G$ moved on Celo
          this week ·{" "}
          <span className="font-mono tabular-nums font-semibold text-foreground">
            {league.points}
          </span>{" "}
          league pts
          {rankInDivision ? (
            <>
              {" "}
              · <span className="font-semibold text-foreground">{rankInDivision}</span> in division
            </>
          ) : null}
        </p>
        {league.nextMove ? (
          <p className="run-next-move mt-3 rounded-xl border-2 border-border-strong bg-streak-soft px-3 py-2 text-sm font-semibold leading-snug text-foreground">
            Next move: {league.nextMove}
          </p>
        ) : null}
        {RECEIPT_CONTRACT_ADDRESS ? (
          <p className="mt-2 text-[10px] text-muted">
            On-chain receipt contract —{" "}
            <a
              href={celoscanContractUrl(RECEIPT_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent underline"
            >
              Celoscan
            </a>
          </p>
        ) : (
          <p className="mt-2 text-[10px] text-muted-dim">
            Celoscan proofs from your quest txs · optional receipt contract deploy later
          </p>
        )}
      </div>
    </section>
  );
}

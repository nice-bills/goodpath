"use client";

import { useImpactStats } from "@/hooks/use-impact-stats";
import { formatCount, hoursUntilClaimReset } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
        {label}
      </p>
    </div>
  );
}

export function ImpactStrip({ className }: { className?: string }) {
  const { data, isLoading, isError } = useImpactStats();
  const { hours, minutes } = hoursUntilClaimReset();

  if (isError) return null;

  return (
    <section
      className={["impact-strip card p-4", className].filter(Boolean).join(" ")}
      aria-label="Community stats"
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="section-label">Community pulse</p>
          <p className="mt-0.5 text-[10px] text-muted-dim">
            All wallets on GoodPath
          </p>
        </div>
        <p className="text-right text-[10px] font-medium text-muted">
          Next claim{" "}
          <span className="font-mono tabular-nums text-foreground">
            {hours}h {minutes}m
          </span>
        </p>
      </div>
      <div className="mt-3 flex divide-x divide-border">
        <Stat
          label="Wallets"
          value={isLoading ? "-" : formatCount(data?.walletsOnPath)}
        />
        <Stat
          label="Paths done"
          value={isLoading ? "-" : formatCount(data?.pathsCompleted)}
        />
        <Stat
          label="Quest steps"
          value={isLoading ? "-" : formatCount(data?.questCompletions)}
        />
        <Stat label="Tips" value={isLoading ? "-" : formatCount(data?.tipsSent)} />
      </div>
    </section>
  );
}

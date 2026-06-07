"use client";

import {
  Coins,
  HandHeart,
  Plant,
  WaveSine,
} from "@phosphor-icons/react";
import {
  COMMITMENT_BONUS_POINTS,
  G_DOLLAR_USE_PATHS,
  type CommitmentUseId,
} from "@goodpath/shared";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useDailyCommitment } from "@/hooks/use-daily-commitment";

const commitIcons = {
  tip: Coins,
  support: HandHeart,
  save: Plant,
  stream: WaveSine,
} as const;

const COMMIT_PATHS = G_DOLLAR_USE_PATHS.filter(
  (p): p is (typeof G_DOLLAR_USE_PATHS)[number] & { id: CommitmentUseId } =>
    p.id !== "flex",
);

export function DailyCommitLock() {
  const { address } = useWalletSession();
  const { lockMove, pending, error } = useDailyCommitment();

  return (
    <div className="todays-run-commit">
      <p className="todays-run-commit-title">Lock your move</p>
      <p className="todays-run-commit-sub">
        Pick one bet for today&apos;s G$. Deliver on-chain for +{COMMITMENT_BONUS_POINTS}{" "}
        league pts.
      </p>
      <div className="commit-lock-grid" role="list">
        {COMMIT_PATHS.map((path) => {
          const Icon = commitIcons[path.id];
          return (
            <button
              key={path.id}
              type="button"
              role="listitem"
              className={`commit-lock-card${path.premium ? " commit-lock-card-premium" : ""}`}
              disabled={pending || !address}
              onClick={() => {
                if (!address) return;
                void lockMove(address, path.id);
              }}
            >
              <span className="commit-lock-icon" aria-hidden>
                <Icon className="h-4 w-4" weight="bold" />
              </span>
              <span className="commit-lock-label">{path.label}</span>
              <span className="commit-lock-sub">{path.subtitle}</span>
              <span className="commit-lock-cta">{pending ? "Locking…" : "Lock this"}</span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="todays-run-commit-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";
import { useMemo } from "react";
import { CORE_PATH_QUEST_IDS, QUESTS } from "@goodpath/shared";
import { referralUrl } from "@/lib/referral";
import type { ProfileResponse } from "@/lib/api";
import { formatPathReceipt, receiptShareLine } from "@/lib/path-receipt";
import { ReceiptScorecard } from "@/components/receipt-scorecard";

function txUrl(hash: string) {
  return `https://celoscan.io/tx/${hash}`;
}

export function PathReceipt({
  profile,
  demo = false,
}: {
  profile: ProfileResponse;
  demo?: boolean;
}) {
  const [copied, setCopied] = useState<"receipt" | "share" | "referral" | null>(
    null,
  );
  const questById = useMemo(
    () => new Map(profile.quests.map((q) => [q.id, q])),
    [profile.quests],
  );
  const coreDone = CORE_PATH_QUEST_IDS.filter((id) =>
    Boolean(questById.get(id)?.completed),
  ).length;

  const copy = async (kind: "receipt" | "share" | "referral") => {
    const text =
      kind === "receipt"
        ? formatPathReceipt(profile)
        : kind === "share"
          ? receiptShareLine(profile)
          : referralUrl(profile.address);
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="receipt-card sticker-receipt-card text-left">
      {demo && (
        <p className="mb-4 rounded-lg border border-border-strong bg-surface-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Demo receipt — sample data
        </p>
      )}

      <p className="font-display text-3xl leading-tight tracking-tight">
        My G$ run — receipt
      </p>
      <p className="mt-2 text-sm text-muted">
        Celo mainnet proofs ·{" "}
        <span className="font-mono text-foreground">
          {profile.address.slice(0, 6)}…{profile.address.slice(-4)}
        </span>
        {profile.league?.points != null ? (
          <>
            {" "}
            · <span className="font-semibold text-foreground">{profile.league.points}</span>{" "}
            league pts
          </>
        ) : null}
      </p>

      <ReceiptScorecard profile={profile} />

      <p className="mt-3 text-center font-mono text-sm text-muted">
        {profile.streak} day streak
        {profile.league?.rank != null
          ? ` · #${profile.league.rank} global this week`
          : ""}
      </p>

      <ul className="receipt-sticker-grid mt-5">
        {QUESTS.map((q, index) => {
          const row = questById.get(q.id);
          const done = row?.completed;
          return (
            <li
              key={q.id}
              className={`receipt-sticker receipt-sticker-${index + 1} ${done ? "is-earned" : ""}`}
            >
              <span
                className={`receipt-sticker-check ${
                  done
                    ? "border-win bg-win-soft text-win"
                    : "border-border-strong bg-surface-muted text-muted-dim"
                }`}
                aria-hidden
              >
                {done ? <Check className="h-3 w-3" weight="bold" /> : "○"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{q.title}</p>
                {row?.txHash ? (
                  <a
                    href={txUrl(row.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block truncate font-mono text-[10px] text-accent underline"
                  >
                    {row.txHash.slice(0, 10)}…
                  </a>
                ) : (
                  <p className="text-xs text-muted">
                    {done ? "Completed" : "Not yet"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="receipt-footer-bar">
        <div>
          <span>Receipt unlocked</span>
          <strong>
            {coreDone} / {CORE_PATH_QUEST_IDS.length} path stickers
          </strong>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copy("referral")}
            className="receipt-footer-share text-[10px] font-semibold"
            title="Copy referral link"
          >
            {copied === "referral" ? "✓" : "Ref"}
          </button>
          <button
            type="button"
            onClick={() => copy("share")}
            className="receipt-footer-share"
            aria-label="Copy share line"
          >
            <ShareNetwork className="h-4 w-4" weight="bold" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => copy("receipt")}
            className="receipt-footer-copy"
          >
            {copied === "receipt" ? "Copied!" : "Copy all"}
          </button>
        </div>
      </div>
    </div>
  );
}

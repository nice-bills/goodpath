"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";
import { useMemo } from "react";
import { CORE_PATH_QUEST_IDS, QUESTS } from "@goodpath/shared";
import { referralUrl } from "@/lib/referral";
import type { ProfileResponse } from "@/lib/api";
import { formatPathReceipt, receiptShareLine } from "@/lib/path-receipt";
import { formatPathDuration } from "@/lib/format";

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
        I completed my G$ Path
      </p>
      <p className="mt-2 text-sm text-muted">
        Sybil-resistant and slightly smug.{" "}
        <span className="font-mono text-foreground">
          {profile.address.slice(0, 6)}…{profile.address.slice(-4)}
        </span>
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-border py-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Streak
          </dt>
          <dd className="font-mono text-lg font-semibold">
            {profile.streak} day{profile.streak === 1 ? "" : "s"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            This week
          </dt>
          <dd className="font-mono text-lg font-semibold">
            {profile.league?.rank != null
              ? `#${profile.league.rank}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            Fastest path
          </dt>
          <dd className="font-mono text-lg font-semibold">
            {profile.personalBests?.fastestPathSeconds
              ? formatPathDuration(profile.personalBests.fastestPathSeconds)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-dim">
            League pts
          </dt>
          <dd className="font-mono text-lg font-semibold">
            {profile.league?.points ?? 0}
          </dd>
        </div>
      </dl>

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

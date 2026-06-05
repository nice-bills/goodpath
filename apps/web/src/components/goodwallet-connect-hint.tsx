"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";

const WALLET_LINK_DOCS =
  "https://docs.gooddollar.org/user-guides/connect-another-wallet-address-to-identity";
const WALLET_LINK_HELPER = "https://h3n3kp.csb.app/";

/** GoodDollar guidance when users may already be verified on GoodWallet (Privy ≠ GoodWallet). */
export function GoodWalletConnectHint({ className }: { className?: string }) {
  return (
    <aside
      className={[
        "rounded-xl border-2 border-dashed border-border-strong bg-accent-soft/60 px-3 py-3 text-xs leading-relaxed text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="font-semibold">Already verified on GoodWallet?</p>
      <p className="mt-1 text-muted">
        Face verification is tied to the wallet you verify. Connect that wallet here (MetaMask /
        WalletConnect), or link it to your GoodDollar identity. Don&apos;t paste a separate
        address.
      </p>
      <p className="mt-2 flex flex-wrap gap-3">
        <a
          href={WALLET_LINK_DOCS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-accent underline-offset-2 hover:underline"
        >
          Link wallet guide
          <ArrowSquareOut className="h-3 w-3" weight="bold" aria-hidden />
        </a>
        <a
          href={WALLET_LINK_HELPER}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-accent underline-offset-2 hover:underline"
        >
          GoodDollar helper
          <ArrowSquareOut className="h-3 w-3" weight="bold" aria-hidden />
        </a>
      </p>
    </aside>
  );
}

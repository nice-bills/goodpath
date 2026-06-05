"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { getAppOrigin } from "@/lib/app-origin";
import { X, Copy, CheckCircle, DeviceMobile } from "@phosphor-icons/react";

export function FvQrPanel({
  fvLink,
  onClose,
  polling,
  verified,
  pollError,
}: {
  fvLink: string;
  onClose: () => void;
  polling: boolean;
  verified: boolean;
  pollError: string | null;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(fvLink, {
      width: 280,
      margin: 2,
      color: { dark: "#1a1a18", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError("Could not render QR. Use the copy link button.");
      });
    return () => {
      cancelled = true;
    };
  }, [fvLink]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fvLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setQrError("Copy failed. Select the link in your browser bar on desktop.");
    }
  };

  return (
    <section
      className="mt-4 rounded-xl border border-border-strong bg-surface-muted p-4"
      aria-label="Verify on phone"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <DeviceMobile className="size-5 text-foreground" weight="bold" aria-hidden />
          <h3 className="text-sm font-semibold">Verify on your phone</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" weight="bold" />
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted">
        Scan with your phone camera or MetaMask browser. Face verification works best on mobile.
        Keep this tab open. We will detect when you are verified on-chain.
      </p>
      <p className="mt-2 break-all font-mono text-[10px] text-muted-dim">
        After FV, your phone returns to: {getAppOrigin()}/quests
      </p>

      <div className="mt-4 flex flex-col items-center">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR code to open GoodDollar face verification on your phone"
            className="rounded-lg border border-border bg-white p-2"
            width={280}
            height={280}
          />
        ) : (
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-surface text-xs text-muted">
            {qrError ?? "Generating QR…"}
          </div>
        )}

        <button type="button" onClick={copyLink} className="btn-secondary mt-3 w-full text-xs">
          {copied ? "Copied!" : (
            <span className="inline-flex items-center justify-center gap-2">
              <Copy className="size-3.5" weight="bold" aria-hidden />
              Copy verification link
            </span>
          )}
        </button>
      </div>

      {verified && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-win">
          <CheckCircle className="size-4" weight="fill" aria-hidden />
          Verified. Updating your quest…
        </p>
      )}

      {polling && !verified && (
        <p className="mt-3 text-center text-xs text-muted">Waiting for on-chain verification…</p>
      )}

      {(pollError || qrError) && !verified && (
        <p className="mt-2 text-xs text-loss">{pollError ?? qrError}</p>
      )}
    </section>
  );
}

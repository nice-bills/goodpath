"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceOnChunkError } from "@/lib/chunk-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GoodPath]", error);
  }, [error]);

  const isChunk = isChunkLoadError(error.message);
  const isWagmi = error.message.includes("WagmiProvider");
  const isCache = error.message.includes("ENOENT") || error.message.includes("_buildManifest");

  useEffect(() => {
    if (isChunk) reloadOnceOnChunkError();
  }, [isChunk]);

  return (
    <main className="flex min-h-[60dvh] flex-col justify-center p-6">
      <div className="card p-6">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="font-display mt-2 text-2xl">The app hit an error</h1>
        <p className="mt-3 text-sm text-muted">
          {isChunk
            ? "The app was updated while this tab was open. Refresh to load the latest version."
            : isWagmi
              ? "Wallet providers were not ready. This usually clears after a dev server restart."
              : isCache
                ? "The Next.js cache (.next) is out of date. Restart with a clean cache."
                : "An unexpected error occurred while loading this page."}
        </p>
        <p className="mt-4 rounded-lg border border-border bg-surface-muted p-3 font-mono text-xs text-muted">
          {error.message}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => (isChunk ? window.location.reload() : reset())}
            className="btn-primary"
          >
            {isChunk ? "Refresh page" : "Try again"}
          </button>
          {!isChunk && (
            <p className="text-center text-xs text-muted-dim">
              Dev fix: stop the server, run{" "}
              <code className="rounded bg-surface-muted px-1 py-0.5">pnpm dev</code> from{" "}
              <code className="rounded bg-surface-muted px-1 py-0.5">apps/web</code> (clears
              .next automatically)
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

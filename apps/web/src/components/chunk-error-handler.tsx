"use client";

import { useEffect } from "react";
import {
  clearChunkReloadFlag,
  isChunkLoadError,
  reloadOnceOnChunkError,
} from "@/lib/chunk-error";

/** Recover from stale lazy chunks after a production deploy. */
export function ChunkErrorHandler() {
  useEffect(() => {
    clearChunkReloadFlag();

    const handleMessage = (message: string) => {
      if (isChunkLoadError(message)) reloadOnceOnChunkError();
    };

    const onError = (event: ErrorEvent) => {
      handleMessage(event.message ?? "");
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "";
      if (isChunkLoadError(message)) {
        event.preventDefault();
        reloadOnceOnChunkError();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

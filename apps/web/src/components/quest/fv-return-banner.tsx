"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { parseFvReturnParams } from "@/lib/fv-callback";

function buildMessage(search: string): { type: "ok" | "err"; text: string } | null {
  if (!search.includes("fv=return")) return null;
  const result = parseFvReturnParams(search);
  if (!result) return null;
  if (result.isVerified) {
    return {
      type: "ok",
      text: 'Face verification passed. Tap "I already verified, refresh" on the verify quest if it has not updated yet.',
    };
  }
  return {
    type: "err",
    text: result.reason ?? "Face verification did not complete. Try again in good light.",
  };
}

/** Shown when the user returns from GoodDollar FV on mobile (redirect callback). */
export function FvReturnBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cleanedRef = useRef(false);

  const query = searchParams.toString();
  const message = useMemo(() => buildMessage(query), [query]);

  useLayoutEffect(() => {
    if (searchParams.get("fv") !== "return" || cleanedRef.current) return;
    cleanedRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("fv");
    url.searchParams.delete("isVerified");
    url.searchParams.delete("isverified");
    url.searchParams.delete("verified");
    url.searchParams.delete("reason");
    url.searchParams.delete("error");
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }, [searchParams, router]);

  if (!message) return null;

  const Icon = message.type === "ok" ? CheckCircle : Warning;

  return (
    <div
      className={`mb-6 flex gap-3 rounded-xl border px-4 py-3 text-sm ${
        message.type === "ok"
          ? "border-win/30 bg-win-soft text-foreground"
          : "border-loss/30 bg-loss-soft text-foreground"
      }`}
    >
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${message.type === "ok" ? "text-win" : "text-loss"}`}
        weight="fill"
        aria-hidden
      />
      <p>{message.text}</p>
    </div>
  );
}

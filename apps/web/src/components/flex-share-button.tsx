"use client";

import { useCallback, useState } from "react";
import { ShareNetwork } from "@phosphor-icons/react";
import type { ProfileResponse } from "@/lib/api";
import { appTabHref } from "@/lib/app-tab";
import { receiptShareLine } from "@/lib/path-receipt";

type FlexShareButtonProps = {
  profile: ProfileResponse;
  /** Short label for compact contexts (e.g. post-claim). */
  label?: string;
  className?: string;
};

export function FlexShareButton({
  profile,
  label = "Flex this",
  className = "btn-primary w-full max-w-[320px]",
}: FlexShareButtonProps) {
  const [state, setState] = useState<"idle" | "sharing" | "copied">("idle");

  const share = useCallback(async () => {
    setState("sharing");
    const text = receiptShareLine(profile);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${appTabHref("celebrate")}`
        : appTabHref("celebrate");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "My G$ run",
          text,
          url,
        });
        setState("idle");
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setState("copied");
        setTimeout(() => setState("idle"), 2000);
      } catch {
        setState("idle");
      }
    }
  }, [profile]);

  return (
    <button
      type="button"
      onClick={() => void share()}
      disabled={state === "sharing"}
      className={className}
    >
      <ShareNetwork className="mr-2 inline h-4 w-4" weight="bold" aria-hidden />
      {state === "sharing"
        ? "Opening share…"
        : state === "copied"
          ? "Link copied!"
          : label}
    </button>
  );
}

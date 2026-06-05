"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import { USE_HONO_API } from "@/lib/data-source";
import { isConvexConfigured } from "@/lib/convex-config";

/** Creates profile + connect quest row when a wallet connects (Convex backend only). */
export function useEnsureConvexProfile(address: string | undefined) {
  const ensure = useMutation(api.profiles.ensure);
  const ensuredFor = useRef<string | null>(null);

  useEffect(() => {
    if (USE_HONO_API || !isConvexConfigured() || !address) return;
    const lower = address.toLowerCase();
    if (ensuredFor.current === lower) return;
    ensuredFor.current = lower;
    void ensure({ address: lower }).catch(() => {
      ensuredFor.current = null;
    });
  }, [address, ensure]);
}

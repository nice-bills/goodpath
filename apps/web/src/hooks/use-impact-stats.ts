"use client";

import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/api";
import { fetchImpactStats } from "@/lib/api";
import { USE_HONO_API } from "@/lib/data-source";
import {
  CONVEX_NOT_CONFIGURED_MESSAGE,
  isConvexConfigured,
} from "@/lib/convex-config";

function useImpactConvex() {
  const convexReady = isConvexConfigured();
  const data = useConvexQuery(
    api.stats.impact,
    USE_HONO_API || !convexReady ? "skip" : {},
  );
  const configError =
    !USE_HONO_API && !convexReady
      ? new Error(CONVEX_NOT_CONFIGURED_MESSAGE)
      : null;
  return {
    data,
    isLoading: convexReady && !USE_HONO_API && data === undefined,
    isError: Boolean(configError),
    error: configError,
  };
}

function useImpactHono() {
  return useTanstackQuery({
    queryKey: ["impact-stats"],
    queryFn: fetchImpactStats,
    enabled: USE_HONO_API,
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useImpactStats() {
  const convex = useImpactConvex();
  const hono = useImpactHono();
  return USE_HONO_API ? hono : convex;
}

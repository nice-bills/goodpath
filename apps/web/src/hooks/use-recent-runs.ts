"use client";

import { useMemo } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/api";
import { USE_HONO_API } from "@/lib/data-source";
import {
  CONVEX_NOT_CONFIGURED_MESSAGE,
  isConvexConfigured,
} from "@/lib/convex-config";

function last24hSinceIso(): string {
  return new Date(Date.now() - 86_400_000).toISOString();
}

export function useRecentRuns(limit = 12) {
  const convexReady = isConvexConfigured();
  const since = useMemo(() => last24hSinceIso(), []);
  const data = useConvexQuery(
    api.activity.recentRuns,
    USE_HONO_API || !convexReady ? "skip" : { limit, since },
  );
  const configError =
    !USE_HONO_API && !convexReady
      ? new Error(CONVEX_NOT_CONFIGURED_MESSAGE)
      : null;

  return {
    events: data?.events ?? [],
    last24hCount: data?.last24hCount ?? 0,
    isLoading: convexReady && !USE_HONO_API && data === undefined,
    isError: Boolean(configError),
    live: convexReady && !USE_HONO_API,
  };
}

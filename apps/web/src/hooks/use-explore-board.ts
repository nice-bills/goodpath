"use client";

import { useMemo } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/api";
import { USE_HONO_API } from "@/lib/data-source";
import {
  CONVEX_NOT_CONFIGURED_MESSAGE,
  isConvexConfigured,
} from "@/lib/convex-config";
import { getPeriodId } from "@/lib/week";

export function useExploreLeaderboard(viewerAddress?: string, limit = 24) {
  const convexReady = isConvexConfigured();
  const periodId = useMemo(() => getPeriodId(), []);
  const data = useConvexQuery(
    api.explore.weeklyLeaderboard,
    USE_HONO_API || !convexReady
      ? "skip"
      : {
          periodId,
          limit,
          viewerAddress: viewerAddress?.toLowerCase(),
        },
  );

  return {
    periodId,
    rows: data?.rows ?? [],
    isLoading: convexReady && !USE_HONO_API && data === undefined,
    live: convexReady && !USE_HONO_API,
    error: !USE_HONO_API && !convexReady ? CONVEX_NOT_CONFIGURED_MESSAGE : null,
  };
}

export function useExploreFlexes(limit = 14) {
  const convexReady = isConvexConfigured();
  const data = useConvexQuery(
    api.explore.recentFlexes,
    USE_HONO_API || !convexReady ? "skip" : { limit },
  );

  return {
    flexes: data?.flexes ?? [],
    isLoading: convexReady && !USE_HONO_API && data === undefined,
    live: convexReady && !USE_HONO_API,
  };
}

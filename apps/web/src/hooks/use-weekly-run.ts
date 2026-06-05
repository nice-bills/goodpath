"use client";

import { useMemo } from "react";
import { useMutation as useConvexMutation, useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/api";
import { USE_HONO_API } from "@/lib/data-source";
import {
  CONVEX_NOT_CONFIGURED_MESSAGE,
  isConvexConfigured,
} from "@/lib/convex-config";
import { getPeriodId } from "@/lib/week";

export function useMyWeeklyRun(address: string | undefined) {
  const convexReady = isConvexConfigured();
  const periodId = useMemo(() => getPeriodId(), []);
  const enabled = Boolean(address) && convexReady && !USE_HONO_API;

  const data = useConvexQuery(
    api.runs.getMyRun,
    enabled ? { address: address!.toLowerCase(), periodId } : "skip",
  );

  return {
    run: data ?? null,
    periodId,
    isLoading: enabled && data === undefined,
    live: enabled,
    configError:
      !USE_HONO_API && !convexReady
        ? new Error(CONVEX_NOT_CONFIGURED_MESSAGE)
        : null,
  };
}

export function useCreateWeeklyRun() {
  const createRun = useConvexMutation(api.runs.createRun);
  const periodId = useMemo(() => getPeriodId(), []);

  return async (
    address: string,
    title: string,
    isPublic = true,
  ) => {
    if (USE_HONO_API) {
      throw new Error("Weekly runs require Convex — set NEXT_PUBLIC_CONVEX_URL");
    }
    return createRun({
      address: address.toLowerCase(),
      title,
      periodId,
      isPublic,
    });
  };
}

export function usePublicWeeklyRuns(limit = 8) {
  const convexReady = isConvexConfigured();
  const periodId = useMemo(() => getPeriodId(), []);
  const enabled = convexReady && !USE_HONO_API;

  const data = useConvexQuery(
    api.runs.listRecentPublicRuns,
    enabled ? { limit, periodId } : "skip",
  );

  return {
    runs: data?.runs ?? [],
    periodId: data?.periodId ?? periodId,
    isLoading: enabled && data === undefined,
    live: enabled,
  };
}

"use client";

import { useMemo } from "react";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/api";
import { fetchProfile, type ProfileResponse } from "@/lib/api";
import { buildDemoProfile } from "@/lib/demo-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { USE_HONO_API } from "@/lib/data-source";
import {
  CONVEX_NOT_CONFIGURED_MESSAGE,
  isConvexConfigured,
} from "@/lib/convex-config";
import { getPeriodId, getWeekStartUtc } from "@/lib/week";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function useProfileConvex(address: string | undefined, enabled: boolean) {
  const convexReady = isConvexConfigured();
  const season = useMemo(
    () => ({ weekStart: getWeekStartUtc(), periodId: getPeriodId() }),
    [],
  );
  const queryEnabled = enabled && convexReady && Boolean(address);
  const result = useConvexQuery(
    api.profiles.get,
    queryEnabled
      ? {
          address: normalizeAddress(address!),
          weekStart: season.weekStart,
          periodId: season.periodId,
        }
      : "skip",
  );
  const isLoading = queryEnabled && result === undefined;
  const configError =
    enabled && !convexReady
      ? new Error(CONVEX_NOT_CONFIGURED_MESSAGE)
      : null;
  return {
    data: result as ProfileResponse | undefined,
    isLoading,
    isFetching: isLoading,
    isError: Boolean(configError),
    error: configError,
    refetch: async () => {},
  };
}

function useProfileHono(address: string | undefined, enabled: boolean) {
  return useTanstackQuery({
    queryKey: ["profile", address],
    queryFn: () => fetchProfile(address!),
    enabled: enabled && Boolean(address),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnMount: false,
    retry: 1,
  });
}

export function useProfile(address: string | undefined) {
  const { active: demoActive, ready: demoReady } = useDemoMode();
  const backendEnabled = demoReady && !demoActive && Boolean(address);

  const convex = useProfileConvex(address, !USE_HONO_API && backendEnabled);
  const hono = useProfileHono(address, USE_HONO_API && backendEnabled);

  if (demoActive) {
    return {
      data: buildDemoProfile(),
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: async () => {},
    };
  }

  if (!demoReady || !address) {
    return {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: async () => {},
    };
  }

  return USE_HONO_API ? hono : convex;
}

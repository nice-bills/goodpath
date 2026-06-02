"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { buildDemoProfile } from "@/lib/demo-profile";
import { useDemoMode } from "@/hooks/use-demo-mode";

export function useProfile(address: string | undefined) {
  const { active: demoActive, ready: demoReady } = useDemoMode();

  return useQuery({
    queryKey: ["profile", address, demoActive],
    queryFn: () => {
      if (demoActive) return Promise.resolve(buildDemoProfile());
      return fetchProfile(address!);
    },
    enabled: demoReady && (demoActive || Boolean(address)),
    staleTime: 30_000,
    refetchInterval: demoActive ? false : 30_000,
    refetchOnMount: false,
    retry: demoActive ? 0 : 1,
  });
}

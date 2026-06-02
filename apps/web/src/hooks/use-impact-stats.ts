"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchImpactStats } from "@/lib/api";

export function useImpactStats() {
  return useQuery({
    queryKey: ["impact-stats"],
    queryFn: fetchImpactStats,
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
  });
}

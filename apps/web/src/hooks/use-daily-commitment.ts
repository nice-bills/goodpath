"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "@convex/api";
import { currentClaimPeriodDate, type CommitmentUseId } from "@goodpath/shared";
import { USE_HONO_API } from "@/lib/data-source";

export function useDailyCommitment() {
  const commit = useConvexMutation(api.commitments.commitDailyMove);
  const claimPeriod = useMemo(() => currentClaimPeriodDate(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockMove = useCallback(
    async (address: string, useId: CommitmentUseId) => {
      if (USE_HONO_API) {
        throw new Error("Daily commits require Convex. Set NEXT_PUBLIC_CONVEX_URL");
      }
      setPending(true);
      setError(null);
      try {
        return await commit({
          address: address.toLowerCase(),
          useId,
          claimPeriod,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not lock move";
        setError(message);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [commit, claimPeriod],
  );

  return { lockMove, pending, error, claimPeriod };
}

"use client";

import { useCallback } from "react";
import { useAction } from "convex/react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@convex/api";
import { completeQuest, ApiError } from "@/lib/api";
import type { QuestId } from "@goodpath/shared";
import { USE_HONO_API } from "@/lib/data-source";

export function useMarkQuestComplete() {
  const queryClient = useQueryClient();
  const completeOnConvex = useAction(api.quests.complete);

  return useCallback(
    async (
      address: string,
      questId: QuestId,
      body?: { txHash?: string; meta?: string },
    ) => {
      if (USE_HONO_API) {
        try {
          const result = await completeQuest(address, questId, body);
          await queryClient.invalidateQueries({ queryKey: ["profile", address] });
          return result;
        } catch (e) {
          throw e as ApiError;
        }
      }

      try {
        const result = await completeOnConvex({
          address: address.toLowerCase(),
          questId,
          txHash: body?.txHash,
          meta: body?.meta,
        });
        return { streak: result.streak, pathComplete: result.pathComplete };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to complete quest";
        throw new ApiError(message, 400);
      }
    },
    [completeOnConvex, queryClient],
  );
}

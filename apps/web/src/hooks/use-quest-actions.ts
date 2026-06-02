"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { completeQuest, type ApiError } from "@/lib/api";
import type { QuestId } from "@goodpath/shared";

export function useMarkQuestComplete() {
  const queryClient = useQueryClient();

  return useCallback(
    async (
      address: string,
      questId: QuestId,
      body?: { txHash?: string; meta?: string },
    ) => {
      try {
        const result = await completeQuest(address, questId, body);
        await queryClient.invalidateQueries({ queryKey: ["profile", address] });
        return result;
      } catch (e) {
        const err = e as ApiError;
        throw err;
      }
    },
    [queryClient],
  );
}

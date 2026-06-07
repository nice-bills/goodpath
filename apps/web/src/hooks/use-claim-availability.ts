"use client";

import { useChainId } from "wagmi";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useClaimEntitlement } from "@/hooks/use-claim-entitlement";
import { useGoodClaimSDK } from "@/hooks/use-good-sdks";
import { SDK_ENV } from "@/lib/env";
import { isDailyClaimDue, profileDailyRun } from "@/lib/daily-claim";
import type { ProfileResponse } from "@/lib/api";

export type ClaimAvailability = {
  /** Recorded for the current GoodDollar claim window (Convex). */
  claimedToday: boolean;
  /** Period says reclaim / first claim is due (ignores on-chain entitlement). */
  reclaimDue: boolean;
  /** Entitlement loaded and &gt; 0 — safe to show primary claim CTAs. */
  canClaimNow: boolean;
  /** Reclaim due but GoodDollar shows 0 G$ (already claimed on-chain or window not open). */
  claimBlocked: boolean;
  checking: boolean;
  entitlementG: number | null;
};

export function useClaimAvailability(
  profile: ProfileResponse | undefined,
): ClaimAvailability {
  const { status } = useWalletSession();
  const chainId = useChainId();
  const { sdk: claimSDK, loading: sdkLoading } = useGoodClaimSDK(SDK_ENV);

  const claimedToday = profile ? profileDailyRun(profile).claimedToday : false;
  const reclaimDue = Boolean(profile && isDailyClaimDue(profile));
  const claimQuest = profile?.quests.find((q) => q.id === "claim");
  const claimUnlocked = Boolean(claimQuest?.unlocked);

  const shouldCheckEntitlement =
    Boolean(profile) &&
    claimUnlocked &&
    status === "ready" &&
    !claimedToday &&
    reclaimDue &&
    !sdkLoading;

  const entitlement = useClaimEntitlement(claimSDK, chainId, shouldCheckEntitlement);
  const entitlementG = entitlement.data ?? null;
  const checking = sdkLoading || (shouldCheckEntitlement && entitlement.isLoading);

  const canClaimNow =
    reclaimDue &&
    !claimedToday &&
    !checking &&
    entitlementG !== null &&
    entitlementG > 0;

  const claimBlocked =
    reclaimDue && !claimedToday && !checking && (entitlementG === 0 || entitlementG === null);

  return {
    claimedToday,
    reclaimDue,
    canClaimNow,
    claimBlocked,
    checking,
    entitlementG,
  };
}

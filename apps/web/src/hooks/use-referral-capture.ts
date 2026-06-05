"use client";

import { useEffect, useRef } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "@convex/api";
import { registerReferral } from "@/lib/api";
import { clearPendingReferrer, captureRefFromLocation, getPendingReferrer } from "@/lib/referral";
import { USE_HONO_API } from "@/lib/data-source";

/** On first wallet connect, attach pending `?ref=` to profile (once). */
export function useReferralCapture(address: string | undefined) {
  const sent = useRef(false);
  const setReferrer = useConvexMutation(api.profiles.setReferrer);

  useEffect(() => {
    captureRefFromLocation();
  }, []);

  useEffect(() => {
    if (!address || sent.current) return;
    const referrer = getPendingReferrer();
    if (!referrer || referrer === address.toLowerCase()) return;

    sent.current = true;
    const run = async () => {
      try {
        if (USE_HONO_API) {
          await registerReferral(address, referrer);
        } else {
          const result = await setReferrer({
            address: address.toLowerCase(),
            referrer: referrer.toLowerCase(),
          });
          if (!result.ok) {
            throw new Error(result.error ?? "Failed to register referral");
          }
        }
        clearPendingReferrer();
      } catch {
        sent.current = false;
      }
    };
    void run();
  }, [address, setReferrer]);
}

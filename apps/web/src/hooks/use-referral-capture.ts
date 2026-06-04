"use client";

import { useEffect, useRef } from "react";
import { registerReferral } from "@/lib/api";
import { clearPendingReferrer, captureRefFromLocation, getPendingReferrer } from "@/lib/referral";

/** On first wallet connect, attach pending `?ref=` to profile (once). */
export function useReferralCapture(address: string | undefined) {
  const sent = useRef(false);

  useEffect(() => {
    captureRefFromLocation();
  }, []);

  useEffect(() => {
    if (!address || sent.current) return;
    const referrer = getPendingReferrer();
    if (!referrer || referrer === address.toLowerCase()) return;

    sent.current = true;
    void registerReferral(address, referrer)
      .then(() => clearPendingReferrer())
      .catch(() => {
        sent.current = false;
      });
  }, [address]);
}

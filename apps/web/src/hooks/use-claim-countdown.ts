"use client";

import { useEffect, useState } from "react";
import { hoursUntilClaimReset } from "@/lib/format";

export type ClaimCountdown = {
  hours: number;
  minutes: number;
  label: string;
  shortLabel: string;
};

function toCountdown(): ClaimCountdown {
  const { hours, minutes } = hoursUntilClaimReset();
  return {
    hours,
    minutes,
    label: `${hours}h ${minutes}m`,
    shortLabel: hours > 0 ? `${hours}h` : `${minutes}m`,
  };
}

/** Live UTC claim window countdown (updates every 30s). */
export function useClaimCountdown() {
  const [countdown, setCountdown] = useState<ClaimCountdown>(() => toCountdown());

  useEffect(() => {
    setCountdown(toCountdown());
    const id = window.setInterval(() => setCountdown(toCountdown()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return countdown;
}

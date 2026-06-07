"use client";

import { useEffect, useState } from "react";
import type { ProfileResponse } from "@/lib/api";
import type { AppTab } from "@/lib/app-tab";
import { isDailyClaimDue } from "@/lib/daily-claim";

const HINT_KEY = "goodpath_claim_tab_hint";

/** Once per session: nudge toward Claim tab when daily claim is due (no auto-navigation). */
export function useClaimTabHint(
  profile: ProfileResponse | undefined,
  tab: AppTab,
): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (tab !== "home" || !profile) {
      setShow(false);
      return;
    }
    const claim = profile.quests.find((q) => q.id === "claim");
    if (!claim?.unlocked || !isDailyClaimDue(profile)) {
      setShow(false);
      return;
    }
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(HINT_KEY)) return;
    sessionStorage.setItem(HINT_KEY, "1");
    setShow(true);
  }, [profile, tab]);

  return {
    show,
    dismiss: () => setShow(false),
  };
}

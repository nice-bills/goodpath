import { deriveDailyRun, isDailyClaimDue as sharedIsDailyClaimDue } from "@goodpath/shared";
import type { ProfileResponse } from "@/lib/api";

export function profileDailyRun(profile: ProfileResponse) {
  return (
    profile.dailyRun ??
    deriveDailyRun({
      lastActiveDate: profile.lastActiveDate,
      streak: profile.streak,
      quests: profile.quests,
      completions: profile.completions,
      league: profile.league,
    })
  );
}

/** True when verify is done and today's claim period is not yet claimed. */
export function isDailyClaimDue(profile: ProfileResponse): boolean {
  if (!profile.completions.verify) return false;
  return sharedIsDailyClaimDue({
    lastActiveDate: profile.lastActiveDate,
    streak: profile.streak,
    quests: profile.quests,
    completions: profile.completions,
    league: profile.league,
  });
}

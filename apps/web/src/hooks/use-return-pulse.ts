"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProfileResponse } from "@/lib/api";

const SNAPSHOT_KEY = "goodpath_league_snapshot";
const SHOWN_KEY = "goodpath_return_pulse_shown";

type LeagueSnapshot = {
  periodId: string;
  points: number;
  rank: number | null;
  divisionRank: number | null;
  personAboveLabel: string | null;
  personAboveGap: number | null;
};

export type ReturnPulse = {
  title: string;
  body: string;
};

function readSnapshot(): LeagueSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LeagueSnapshot;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: LeagueSnapshot) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function snapshotFromProfile(profile: ProfileResponse): LeagueSnapshot | null {
  const league = profile.league;
  if (!league?.periodId) return null;
  return {
    periodId: league.periodId,
    points: league.points,
    rank: league.rank ?? null,
    divisionRank: league.divisionRank ?? null,
    personAboveLabel: league.personAbove?.label ?? null,
    personAboveGap: league.personAbove?.gap ?? null,
  };
}

function buildPulse(
  prev: LeagueSnapshot,
  profile: ProfileResponse,
): ReturnPulse | null {
  const league = profile.league;
  if (!league || league.periodId !== prev.periodId) return null;

  const rankNow = league.rank;
  const rankWas = prev.rank;

  if (
    rankWas != null &&
    rankNow != null &&
    rankNow > rankWas
  ) {
    const drop = rankNow - rankWas;
    return {
      title: "You got passed on the board",
      body: `You slipped ${drop} spot${drop === 1 ? "" : "s"} to #${rankNow} while you were away. One claim or on-chain move puts you back in the fight.`,
    };
  }

  const divWas = prev.divisionRank;
  const divNow = league.divisionRank;
  if (
    divWas != null &&
    divNow != null &&
    divNow > divWas
  ) {
    return {
      title: "Someone moved ahead in your division",
      body: `You're #${divNow} in ${league.divisionLabel ?? "your division"} now. Close the gap before the week resets.`,
    };
  }

  const gapNow = league.personAbove?.gap ?? null;
  const gapWas = prev.personAboveGap;
  const aboveLabel = league.personAbove?.label?.replace(/^Benchmark\s*·\s*/i, "");
  if (
    gapWas != null &&
    gapNow != null &&
    gapNow < gapWas &&
    aboveLabel
  ) {
    const closed = gapWas - gapNow;
    if (closed >= 2) {
      return {
        title: `${aboveLabel} is still ahead`,
        body: `They gained ${closed} pts on you since your last visit. ${gapNow} pts left to pass them.`,
      };
    }
  }

  if (league.points < prev.points) {
    return {
      title: "Your weekly score dipped",
      body: `You were at ${prev.points} pts last visit. You're at ${league.points} now. Claim or move G$ on-chain to heat back up.`,
    };
  }

  return null;
}

/** Compare league standing vs last visit; show once per session. */
export function useReturnPulse(profile: ProfileResponse | undefined) {
  const [pulse, setPulse] = useState<ReturnPulse | null>(null);

  useEffect(() => {
    if (!profile?.league) return;

    const current = snapshotFromProfile(profile);
    if (!current) return;

    const prev = readSnapshot();
    const alreadyShown =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SHOWN_KEY) === current.periodId;

    if (prev && !alreadyShown) {
      const next = buildPulse(prev, profile);
      if (next) {
        setPulse(next);
        sessionStorage?.setItem(SHOWN_KEY, current.periodId);
      }
    }

    writeSnapshot(current);
  }, [profile]);

  const dismiss = useCallback(() => setPulse(null), []);

  return { pulse, dismiss };
}

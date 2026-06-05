"use client";

import type { ProfileResponse } from "@/lib/api";
import { FlexShareButton } from "@/components/flex-share-button";
import { TabLink } from "@/components/tab-link";

type Moment = "claim" | "rank" | "path";

function momentCopy(profile: ProfileResponse): { kind: Moment; title: string; sub: string; label: string } | null {
  const claim = profile.quests.find((q) => q.id === "claim");
  const pathDone = Boolean(profile.pathCompletedAt);

  if (pathDone) {
    return {
      kind: "path",
      title: "Path complete — flex it",
      sub: "Your receipt has G$ moved, division rank, and Celoscan proofs.",
      label: "Share path receipt",
    };
  }

  if (profile.league?.promoted) {
    return {
      kind: "rank",
      title: "You moved up this week",
      sub: `Top of ${profile.league.divisionLabel ?? "your"} division energy — share before the board resets.`,
      label: "Flex rank-up",
    };
  }

  if (claim?.completed) {
    return {
      kind: "claim",
      title: "Claim on the board",
      sub: "Drop your run in the group chat — real wallet, real on-chain proof.",
      label: "Flex this claim",
    };
  }

  return null;
}

/** Post-claim / rank-up / path flex — only when there is something real to share. */
export function HomeFlexMoment({ profile }: { profile: ProfileResponse }) {
  const moment = momentCopy(profile);
  if (!moment) return null;

  return (
    <section className="vibe-flex-moment" aria-label="Share your run">
      <p className="vibe-flex-moment-title">{moment.title}</p>
      <p className="vibe-flex-moment-sub">{moment.sub}</p>
      <FlexShareButton profile={profile} label={moment.label} className="btn-primary w-full" />
      {moment.kind === "path" ? (
        <TabLink tab="celebrate" className="vibe-flex-moment-link">
          Open full receipt
        </TabLink>
      ) : null}
    </section>
  );
}

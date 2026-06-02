"use client";

import { Coins, Fire, Heart, Medal } from "@phosphor-icons/react";
import { TabLink } from "@/components/tab-link";

export function TodaysHabit({ streak }: { streak: number }) {
  return (
    <section className="habit-card mb-6">
      <div>
        <p className="section-label mb-1">Next daily habit</p>
        <h2>Claim again tomorrow</h2>
        <p>
          Path complete. Keep the loop alive: claim daily, stay verified, stay generous.
        </p>
      </div>
      <div className="habit-medal" aria-hidden>
        <Medal weight="duotone" />
      </div>

      <div className="habit-streak">
        <Fire className="size-5" weight="fill" aria-hidden />
        <span>{streak} day streak</span>
        <small>keep it warm</small>
      </div>

      <div className="mt-4 grid gap-2">
        <TabLink
          tab="quests"
          hash="claim"
          className="btn-primary flex items-center justify-center gap-2 text-sm"
        >
          <Coins className="size-4" weight="bold" aria-hidden />
          Claim today&apos;s G$
        </TabLink>
        <TabLink
          tab="quests"
          hash="support"
          className="btn-secondary flex items-center justify-center gap-2 text-xs"
        >
          <Heart className="size-3.5" weight="bold" aria-hidden />
          Support GoodCollective
        </TabLink>
      </div>
    </section>
  );
}

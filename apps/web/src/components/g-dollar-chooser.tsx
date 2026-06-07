"use client";

import {
  Coins,
  HandHeart,
  Plant,
  ShareNetwork,
  WaveSine,
} from "@phosphor-icons/react";
import { G_DOLLAR_USE_PATHS, type GDollarUsePath } from "@goodpath/shared";
import { TabLink } from "@/components/tab-link";

const useIcons = {
  tip: Coins,
  support: HandHeart,
  save: Plant,
  stream: WaveSine,
  flex: ShareNetwork,
} as const;

function UseOption({ path }: { path: GDollarUsePath }) {
  const Icon = useIcons[path.id];
  const className = `g-use-option${path.premium ? " g-use-option-premium" : ""}`;

  const inner = (
    <>
      <span className="g-use-option-icon" aria-hidden>
        <Icon className="h-4 w-4" weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug">{path.label}</span>
        <span className="mt-0.5 block text-[11px] text-muted">{path.subtitle}</span>
      </span>
      {path.premium ? (
        <span className="g-use-option-badge">Top status</span>
      ) : null}
    </>
  );

  if (path.tab === "celebrate") {
    return (
      <TabLink tab="celebrate" className={className}>
        {inner}
      </TabLink>
    );
  }

  return (
    <TabLink tab="quests" hash={path.hash} className={className}>
      {inner}
    </TabLink>
  );
}

export function GDollarChooser({
  title = "Put today's G$ to work",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={compact ? "g-use-chooser g-use-chooser-compact" : "g-use-chooser"}
      aria-label={title}
    >
      <p className="g-use-chooser-title">{title}</p>
      <div className="g-use-chooser-grid">
        {G_DOLLAR_USE_PATHS.map((path) => (
          <UseOption key={path.id} path={path} />
        ))}
      </div>
    </section>
  );
}

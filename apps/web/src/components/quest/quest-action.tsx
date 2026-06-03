"use client";

import dynamic from "next/dynamic";
import type { QuestStatus } from "@/lib/api";

const VerifyAction = dynamic(
  () => import("./actions/verify-action").then((m) => ({ default: m.VerifyAction })),
  { loading: () => <p className="mt-3 text-xs text-muted">Loading verification…</p> },
);

const ClaimAction = dynamic(
  () => import("./actions/claim-action").then((m) => ({ default: m.ClaimAction })),
  { loading: () => <p className="mt-3 text-xs text-muted">Loading claim…</p> },
);

const TipAction = dynamic(
  () => import("./actions/tip-action").then((m) => ({ default: m.TipAction })),
  { loading: () => <p className="mt-3 text-xs text-muted">Loading tip…</p> },
);

const SupportAction = dynamic(
  () => import("./actions/support-action").then((m) => ({ default: m.SupportAction })),
  { loading: () => <p className="mt-3 text-xs text-muted">Loading…</p> },
);

const DeployAction = dynamic(
  () => import("./actions/deploy-action").then((m) => ({ default: m.DeployAction })),
  { loading: () => <p className="mt-3 text-xs text-muted">Loading deploy…</p> },
);

export function QuestAction({
  quest,
  onUpdated,
  inline,
}: {
  quest: QuestStatus;
  onUpdated: () => void;
  inline?: boolean;
}) {
  const variant = inline ? "embedded" : "standalone";
  switch (quest.kind) {
    case "identity":
      return <VerifyAction quest={quest} onUpdated={onUpdated} variant={variant} />;
    case "claim":
      return <ClaimAction quest={quest} onUpdated={onUpdated} variant={variant} />;
    case "transfer":
      return <TipAction quest={quest} onUpdated={onUpdated} variant={variant} />;
    case "external":
      return <SupportAction quest={quest} onUpdated={onUpdated} variant={variant} />;
    case "deploy":
      return <DeployAction quest={quest} onUpdated={onUpdated} variant={variant} />;
    case "auto":
      return null;
    default:
      return null;
  }
}

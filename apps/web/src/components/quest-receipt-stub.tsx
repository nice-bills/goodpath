"use client";

import { ShareNetwork } from "@phosphor-icons/react";
import { useState } from "react";
import type { ProfileResponse } from "@/lib/api";
import { receiptShareLine } from "@/lib/path-receipt";
import { TabLink } from "@/components/tab-link";

export function QuestReceiptStub({ profile }: { profile: ProfileResponse }) {
  const [copied, setCopied] = useState(false);
  const earned = profile.quests.filter((q) => q.completed).length;
  const total = profile.quests.length;

  const share = async () => {
    await navigator.clipboard.writeText(receiptShareLine(profile));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="quest-receipt-stub">
      <div>
        <span>Receipt unlocked</span>
        <strong>
          {earned} / {total} stickers
        </strong>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={share} className="quest-receipt-stub-share" aria-label="Copy share line">
          <ShareNetwork className="h-4 w-4" weight="bold" aria-hidden />
        </button>
        <TabLink tab="celebrate" className="quest-receipt-stub-link">
          {copied ? "Copied!" : "Open"}
        </TabLink>
      </div>
    </div>
  );
}

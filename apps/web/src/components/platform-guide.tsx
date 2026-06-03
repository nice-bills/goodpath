"use client";

import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import { isMobileBrowser } from "@/lib/mobile-wallet";
import { useIsDesktop } from "@/hooks/use-viewport";

type PlatformGuideProps = {
  /** Narrow copy on quest / verify screens */
  variant?: "full" | "compact";
};

/**
 * Explains how the same path works on phone vs desktop (FV on mobile, signing on both).
 */
export function PlatformGuide({ variant = "full" }: PlatformGuideProps) {
  const desktop = useIsDesktop();
  const onPhone = isMobileBrowser();

  if (variant === "compact") {
    return (
      <p className="platform-guide-compact" role="note">
        {onPhone ? (
          <>
            <strong>Mobile:</strong> Face verify and wallet signing work best here. Use MetaMask
            in-app browser if WalletConnect drops.
          </>
        ) : desktop ? (
          <>
            <strong>Desktop:</strong> Connect here; scan the verify QR with your phone for face
            verification. Claim, tip, and deploy sign in this browser.
          </>
        ) : (
          <>
            <strong>Tip:</strong> Verify on your phone; claim and move G$ on phone or desktop.
          </>
        )}
      </p>
    );
  }

  return (
    <aside className="platform-guide" aria-label="How G$ Path works on mobile and web">
      <p className="section-label mb-3">Mobile &amp; web</p>
      <div className="platform-guide-grid">
        <div className="platform-guide-card">
          <DeviceMobile className="h-5 w-5 shrink-0" weight="duotone" aria-hidden />
          <div>
            <strong className="block text-sm font-semibold text-foreground">Phone</strong>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Best for face verification and MetaMask in-app signing. Same Wi‑Fi? Run{" "}
              <code className="rounded bg-surface-muted px-1 text-[10px]">pnpm dev:lan</code>{" "}
              and open the LAN URL on your phone.
            </p>
          </div>
        </div>
        <div className="platform-guide-card">
          <Desktop className="h-5 w-5 shrink-0" weight="duotone" aria-hidden />
          <div>
            <strong className="block text-sm font-semibold text-foreground">Desktop</strong>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              MetaMask or Privy email wallet. Scan the verify QR with your phone, then claim, tip,
              support, and deploy (save/stream) in this browser on Celo.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

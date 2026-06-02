"use client";

import { usePrivyEmbeddedWalletLink } from "@/hooks/use-privy-embedded-wallet";

/** Must render inside PrivyProvider + @privy-io/wagmi WagmiProvider. */
export function PrivyWagmiSync({ children }: { children: React.ReactNode }) {
  usePrivyEmbeddedWalletLink({ autoRestore: true });
  return children;
}

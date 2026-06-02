"use client";

/** @deprecated Logic lives in use-privy-embedded-wallet — kept for imports. */
export {
  usePrivyEmbeddedWalletLink as useSyncPrivyWagmi,
  type PrivyWalletSetupPhase,
} from "@/hooks/use-privy-embedded-wallet";

export { useWalletSession } from "@/hooks/use-wallet-session";

import { useWalletSession } from "@/hooks/use-wallet-session";

/** Prefer `useWalletSession()` for status + address. */
export function usePrivyWalletAddress(): `0x${string}` | undefined {
  return useWalletSession().address;
}

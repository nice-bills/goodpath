import type { ConnectedWallet } from "@privy-io/react-auth";
import { getEmbeddedConnectedWallet } from "@privy-io/react-auth";

export function pickPrivyWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  return (
    getEmbeddedConnectedWallet(wallets) ??
    wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "privy-v2") ??
    wallets.find((w) => w.connectorType === "embedded") ??
    wallets[0] ??
    null
  );
}

export function walletAlreadyExistsError(message: string): boolean {
  return /already exists|already created|duplicate/i.test(message);
}

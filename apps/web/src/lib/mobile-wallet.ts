import { hasBrowserWallet } from "@/lib/ethereum";

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** MetaMask in-app browser on phone — use injected(), not WalletConnect. */
export function isMetaMaskInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  if (!isMobileBrowser()) return false;
  const eth = window.ethereum;
  if (!eth) return false;
  if (eth.isMetaMask) return true;
  return Boolean(eth.providers?.some((p) => p.isMetaMask));
}

/** WalletConnect relay WS is flaky on mobile Safari; prefer MetaMask browser deeplink. */
export function shouldOfferWalletConnect(): boolean {
  if (!isMobileBrowser()) return true;
  return !hasBrowserWallet();
}

/** Stale WC sessions cause "Connection interrupted while trying to subscribe" on reload. */
const WC_KEY_PREFIXES = new Set(["wc@", "walletconnect", "WALLETCONNECT"]);

function isWalletConnectKey(key: string): boolean {
  if (WC_KEY_PREFIXES.has(key)) return true;
  for (const p of WC_KEY_PREFIXES) {
    if (key.startsWith(p) || key.includes(p)) return true;
  }
  return false;
}

export function clearWalletConnectStorage(): void {
  if (typeof localStorage === "undefined") return;
  for (const key of Object.keys(localStorage)) {
    if (isWalletConnectKey(key)) localStorage.removeItem(key);
  }
}

/**
 * Opens this dapp inside MetaMask's in-app browser (injects window.ethereum).
 * Use the full https URL so MetaMask loads the tunnel/LAN host correctly.
 */
export function metamaskDappBrowserUrl(): string {
  if (typeof window === "undefined") return "https://metamask.io/download/";
  const url = window.location.href;
  return `https://metamask.app.link/dapp/${encodeURIComponent(url)}`;
}

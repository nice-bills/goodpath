/** Browser wallet helpers (MetaMask, Rabby, etc.) */
export function hasBrowserWallet(): boolean {
  if (typeof window === "undefined") return false;
  const eth = window.ethereum;
  if (!eth) return false;
  if (eth.isMetaMask) return true;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) return true;
  return typeof eth.request === "function";
}

export function walletLabel(): string {
  if (typeof window === "undefined") return "Browser wallet";
  const eth = window.ethereum;
  if (eth?.isMetaMask) return "MetaMask";
  if (eth?.providers?.some((p) => p.isMetaMask)) return "MetaMask";
  if (eth) return "Browser wallet";
  return "Browser wallet";
}

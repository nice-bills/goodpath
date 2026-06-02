import type { EIP1193Provider } from "viem";

/** Active injected provider (MetaMask when multiple wallets are installed). */
export function getInjectedProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = window.ethereum;
  if (!eth) return undefined;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const metaMask = eth.providers.find((p) => p.isMetaMask);
    return (metaMask ?? eth.providers[0]) as EIP1193Provider;
  }
  return eth as EIP1193Provider;
}

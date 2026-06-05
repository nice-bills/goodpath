import { http, createConfig, type Config, type CreateConnectorFn } from "wagmi";
import { celo } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { createConfig as createPrivyConfig } from "@privy-io/wagmi";
import { WC_PROJECT_ID } from "@/lib/env";
import { isPrivyEnabled } from "@/lib/privy-config";
import { shouldOfferWalletConnect } from "@/lib/mobile-wallet";

const CELO_HTTP = http("https://forno.celo.org");

let cached: Config | undefined;
let cachedKey: string | undefined;

function configCacheKey(): string {
  const mode = isPrivyEnabled ? "privy" : "legacy";
  const wc = shouldOfferWalletConnect() ? "wc" : "injected-only";
  return `${mode}:${wc}`;
}

function legacyConnectors(): CreateConnectorFn[] {
  const connectors: CreateConnectorFn[] = [
    injected({
      shimDisconnect: true,
    }),
  ];

  if (WC_PROJECT_ID && shouldOfferWalletConnect()) {
    connectors.push(
      walletConnect({
        projectId: WC_PROJECT_ID,
        showQrModal: true,
        metadata: {
          name: "GoodPath",
          description: "Mark your progress on the GoodDollar path",
          url: typeof window !== "undefined" ? window.location.origin : "https://goodpath.app",
          icons: [
            typeof window !== "undefined"
              ? `${window.location.origin}/brand/mark.svg`
              : "https://goodpath.app/brand/mark.svg",
          ],
        },
      }),
    );
  }

  return connectors;
}

/** Call only in the browser (after mount). */
export function getWagmiConfig(): Config {
  const key = configCacheKey();
  if (cached && cachedKey === key) return cached;

  if (isPrivyEnabled) {
    cachedKey = key;
    cached = createPrivyConfig({
      chains: [celo],
      transports: {
        [celo.id]: CELO_HTTP,
      },
    });
    return cached;
  }

  cachedKey = key;
  cached = createConfig({
    chains: [celo],
    connectors: legacyConnectors(),
    multiInjectedProviderDiscovery: true,
    transports: {
      [celo.id]: CELO_HTTP,
    },
    ssr: false,
  });

  return cached;
}

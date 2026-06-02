"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { Config } from "wagmi";
import { PRIVY_APP_ID, privyConfig } from "@/lib/privy-config";
import { PrivyWagmiSync } from "@/components/privy-wagmi-sync";

export function PrivyProviders({
  children,
  queryClient,
  wagmiConfig,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
  wagmiConfig: Config;
}) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          <PrivyWagmiSync>{children}</PrivyWagmiSync>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

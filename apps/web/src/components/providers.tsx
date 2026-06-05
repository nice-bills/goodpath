"use client";

import { useEffect, useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getWagmiConfig } from "@/lib/wagmi-config";
import { isPrivyEnabled } from "@/lib/privy-config";
import { PrivyProviders } from "@/components/privy-providers";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { useEnsureConvexProfile } from "@/hooks/use-ensure-convex-profile";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { clearWalletConnectStorage, isMetaMaskInAppBrowser } from "@/lib/mobile-wallet";

function ConvexWalletBootstrap() {
  const { status, address } = useWalletSession();
  useEnsureConvexProfile(status === "ready" ? address : undefined);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 60_000,
          },
        },
      }),
  );

  const wagmiConfig = useMemo(() => {
    if (!mounted) return null;
    return getWagmiConfig();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (isMetaMaskInAppBrowser()) clearWalletConnectStorage();
  }, [mounted]);

  if (!mounted || !wagmiConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <ConvexClientProvider>
          <div className="app-shell flex min-h-dvh flex-col">
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-sm text-muted">Loading wallet…</p>
            </div>
          </div>
        </ConvexClientProvider>
      </QueryClientProvider>
    );
  }

  const shell = (
    <div className="app-shell flex min-h-dvh flex-col">{children}</div>
  );

  if (isPrivyEnabled) {
    return (
      <PrivyProviders queryClient={queryClient} wagmiConfig={wagmiConfig}>
        <ConvexClientProvider>
          <ConvexWalletBootstrap />
          {shell}
        </ConvexClientProvider>
      </PrivyProviders>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={!isMetaMaskInAppBrowser()}>
      <QueryClientProvider client={queryClient}>
        <ConvexClientProvider>
          <ConvexWalletBootstrap />
          {shell}
        </ConvexClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

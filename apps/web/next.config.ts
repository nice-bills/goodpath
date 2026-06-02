import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(fileURLToPath(import.meta.url));
/** Webpack needs absolute paths; Turbopack needs relative (see experimental.turbo). */
const stubAbs = join(webRoot, "src/lib/empty-module.ts");
const stubRel = "./src/lib/empty-module.ts";

const webpackOptionalDepAliases = {
  "@react-native-async-storage/async-storage": stubAbs,
  "pino-pretty": stubAbs,
  "@farcaster/mini-app-solana": stubAbs,
} as const;

const turboOptionalDepAliases = {
  "@react-native-async-storage/async-storage": stubRel,
  "pino-pretty": stubRel,
  "@farcaster/mini-app-solana": stubRel,
} as const;

/** One public tunnel (ngrok/cloudflared) → port 3000; API proxied at /goodpath-api */
const useApiProxy = process.env.USE_API_PROXY === "true";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@goodpath/shared",
    "@goodsdks/citizen-sdk",
    "@goodsdks/react-hooks",
    "@privy-io/react-auth",
    "@privy-io/wagmi",
  ],
  async rewrites() {
    if (!useApiProxy) return [];
    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001";
    return [{ source: "/goodpath-api/:path*", destination: `${target}/:path*` }];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackOptionalDepAliases,
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: turboOptionalDepAliases,
    },
  },
};

export default nextConfig;

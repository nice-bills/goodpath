import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(fileURLToPath(import.meta.url));
/** Trace server deps from monorepo root (pnpm hoists @goodsdks/*, better-sqlite3, etc.). */
const monorepoRoot = join(webRoot, "../..");
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
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/goodpath-api/[[...path]]": [
      "node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3/**",
      "node_modules/.pnpm/@goodsdks+citizen-sdk@*/node_modules/@goodsdks/citizen-sdk/**",
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
  transpilePackages: [
    "@goodpath/api",
    "@goodpath/shared",
    "@goodsdks/citizen-sdk",
    "@goodsdks/react-hooks",
    "@privy-io/react-auth",
    "@privy-io/wagmi",
  ],
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001";
    /** Dev/tunnel: proxy to :3001 so Turbopack never bundles API `.js` → `.ts` source tree. */
    if (process.env.NODE_ENV === "development" || useApiProxy) {
      return [{ source: "/goodpath-api/:path*", destination: `${target}/:path*` }];
    }
    return [];
  },
  webpack: (config, { dev }) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackOptionalDepAliases,
    };
    /** Production only: bundle API from TS source for file tracing (not used in `next dev`). */
    if (!dev) {
      config.resolve.alias["@goodpath/api/app"] = join(
        monorepoRoot,
        "services/api/src/app.ts",
      );
    }
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: turboOptionalDepAliases,
    },
  },
};

export default nextConfig;

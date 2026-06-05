#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const convexTmp = join(root, ".convex-tmp");
const useLegacyApi = process.env.GOODPATH_USE_HONO_API === "1";

/** Avoid EXDEV when /tmp and the repo are on different filesystems (e.g. btrfs + tmpfs). */
const devEnv = {
  ...process.env,
  CONVEX_TMPDIR: process.env.CONVEX_TMPDIR ?? convexTmp,
  TMPDIR: process.env.TMPDIR ?? convexTmp,
};

async function devAlreadyRunning() {
  if (process.env.GOODPATH_DEV_FORCE === "1") return false;
  try {
    const [health, home] = await Promise.all([
      fetch("http://127.0.0.1:3000/api/health", {
        signal: AbortSignal.timeout(2500),
      }),
      fetch("http://127.0.0.1:3000/", {
        signal: AbortSignal.timeout(2500),
      }),
    ]);
    return health.ok && home.ok;
  } catch {
    return false;
  }
}

if (await devAlreadyRunning()) {
  console.log(
    "[goodpath] dev already running at http://localhost:3000 — not restarting.\n" +
      "  Set GOODPATH_DEV_FORCE=1 to kill ports and start fresh.",
  );
  process.exit(0);
}

execSync("node scripts/kill-dev.mjs", { cwd: root, stdio: "inherit", env: devEnv });

const backendLabel = useLegacyApi ? "api" : "convex";
const backendCmd = useLegacyApi
  ? "pnpm --filter @goodpath/api dev"
  : "npx convex dev";

console.log(`[goodpath] starting web + ${backendLabel} …\n`);

const child = spawn(
  "pnpm",
  [
    "exec",
    "concurrently",
    "-k",
    "-n",
    `web,${backendLabel}`,
    "pnpm --filter @goodpath/web dev",
    backendCmd,
  ],
  { cwd: root, stdio: "inherit", env: devEnv },
);

child.on("exit", (code) => process.exit(code ?? 0));

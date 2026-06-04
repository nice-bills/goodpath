#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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

execSync("node scripts/kill-dev.mjs", { cwd: root, stdio: "inherit" });

execSync("pnpm --filter @goodpath/shared build && pnpm --filter @goodpath/api build", {
  cwd: root,
  stdio: "inherit",
});

console.log(
  "[goodpath] starting web (Turbopack :3000) + API (:3001) — fast local dev.\n" +
    "  Tip: avoid GOODPATH_DEV_CLEAR=1 unless you need a clean Next cache.\n",
);

const child = spawn(
  "pnpm",
  [
    "exec",
    "concurrently",
    "-k",
    "-n",
    "web,api",
    "pnpm --filter @goodpath/web dev",
    "pnpm --filter @goodpath/api dev",
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: "http://localhost:3001",
    },
  },
);

child.on("exit", (code) => process.exit(code ?? 0));

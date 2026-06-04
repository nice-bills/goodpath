#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "../..");
const port = process.env.PORT ?? "3001";

try {
  execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: "ignore" });
  console.log(`[goodpath/api] stopped previous process on :${port}`);
} catch {
  /* nothing listening */
}

execSync("pnpm --filter @goodpath/shared build", {
  cwd: repoRoot,
  stdio: "inherit",
});
execSync("pnpm exec tsc -p tsconfig.json", { cwd: root, stdio: "inherit" });

console.log(`[goodpath/api] http://127.0.0.1:${port} (tsc --watch + node --watch dist)`);

const tsc = spawn("pnpm", ["exec", "tsc", "-p", "tsconfig.json", "--watch", "--preserveWatchOutput"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

const node = spawn("node", ["--watch", "dist/index.js"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

function shutdown(code = 0) {
  tsc.kill("SIGTERM");
  node.kill("SIGTERM");
  process.exit(code);
}

tsc.on("exit", (code) => {
  if (code && code !== 0) shutdown(code);
});
node.on("exit", (code) => shutdown(code ?? 0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

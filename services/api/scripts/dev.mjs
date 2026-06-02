#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT ?? "3001";

try {
  execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: "ignore" });
  console.log(`[goodpath/api] stopped previous process on :${port}`);
} catch {
  /* nothing listening */
}

console.log(`[goodpath/api] starting on :${port} …`);

const child = spawn("pnpm", ["exec", "tsx", "watch", "src/index.ts"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 0));

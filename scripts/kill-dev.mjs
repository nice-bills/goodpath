#!/usr/bin/env node
/** Stop goodpath dev servers and clear the Next.js cache. */
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = join(root, "apps/web/.next");

try {
  execSync('pkill -f "code/goodpath.*concurrently" 2>/dev/null', { stdio: "ignore" });
} catch {
  /* none */
}

for (const port of ["3000", "3001"]) {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: "ignore" });
    console.log(`[goodpath] stopped :${port}`);
  } catch {
    /* not running */
  }
}

execSync("sleep 0.6");

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("[goodpath] cleared apps/web/.next");
}

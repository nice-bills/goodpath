#!/usr/bin/env node
/**
 * Next.js dev — Turbopack by default (faster clicks in dev). Set USE_WEBPACK=1 for webpack.
 */
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT ?? "3000";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const useWebpack = process.env.USE_WEBPACK === "1";

const args = ["exec", "next", "dev", "-p", port, "-H", hostname];
if (!useWebpack) args.push("--turbopack");

console.log(
  `[goodpath/web] http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port}` +
    (useWebpack ? " (webpack)" : " (turbopack)"),
);

const child = spawn("pnpm", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));

#!/usr/bin/env node
/**
 * Dev servers reachable from your phone on the same WiFi.
 * Open the printed URL in MetaMask → Browser (not Safari/Chrome alone).
 */
import { spawn, execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getLanIp } from "./lan-ip.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ip = process.env.LAN_IP ?? getLanIp();

if (!ip) {
  console.error("[goodpath] Could not detect LAN IP. Set LAN_IP=192.168.x.x and retry.");
  process.exit(1);
}

const webOrigin = `http://${ip}:3000`;
const apiUrl = `http://${ip}:3001`;

console.log(`
┌─────────────────────────────────────────────────────────────┐
│  G$ Path — phone access (same WiFi as this laptop)          │
├─────────────────────────────────────────────────────────────┤
│  1. On your phone, open the MetaMask app                    │
│  2. Menu → Browser                                          │
│  3. Go to:                                                   │
│                                                             │
│     ${webOrigin.padEnd(55)}│
│                                                             │
│  API: ${apiUrl.padEnd(51)}│
└─────────────────────────────────────────────────────────────┘
`);

execSync("node scripts/kill-dev.mjs", { cwd: root, stdio: "inherit" });

const env = {
  ...process.env,
  HOSTNAME: "0.0.0.0",
  HOST: "0.0.0.0",
  NEXT_PUBLIC_APP_URL: webOrigin,
  NEXT_PUBLIC_API_URL: apiUrl,
  CORS_ORIGINS: `${webOrigin},http://localhost:3000,http://127.0.0.1:3000`,
};

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
  { cwd: root, stdio: "inherit", env },
);

child.on("exit", (code) => process.exit(code ?? 0));

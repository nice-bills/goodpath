#!/usr/bin/env node
/**
 * Dev with API proxy — expose only port 3000 via ngrok or cloudflared.
 *
 * Usage:
 *   pnpm dev:tunnel          → starts app, then opens a tunnel if installed
 *   pnpm dev:tunnel --only   → app only; run `ngrok http 3000` yourself
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const onlyApp = process.argv.includes("--only");
const port = 3000;

function waitForPort(p, ms = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const s = createConnection({ port: p, host: "127.0.0.1" });
      s.once("connect", () => {
        s.end();
        resolve();
      });
      s.once("error", () => {
        s.destroy();
        if (Date.now() - start > ms) reject(new Error(`Port ${p} not ready`));
        else setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });
}

function which(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function printPublicUrlBanner(publicUrl) {
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│  Use this URL on your laptop AND phone (not localhost):      │
│                                                              │
│    ${publicUrl.padEnd(58)}│
│                                                              │
│  QR / face-verification callbacks require this host.         │
└──────────────────────────────────────────────────────────────┘
`);
}

function persistPublicUrl(publicUrl) {
  const envPath = join(root, "apps/web/.env.development.local");
  const line = `NEXT_PUBLIC_APP_URL=${publicUrl}\n`;
  try {
    writeFileSync(envPath, line, { flag: "w" });
    console.log(`[goodpath] Wrote ${envPath} — restart dev if QR still shows localhost.\n`);
  } catch {
    /* optional */
  }
}

function startCloudflaredTunnel() {
  return new Promise((resolve, reject) => {
    const proc = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const deadline = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Timed out waiting for cloudflared public URL"));
    }, 120_000);

    const tryMatch = (chunk) => {
      process.stderr.write(chunk);
      const text = chunk.toString();
      const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) {
        clearTimeout(deadline);
        resolve({ proc, url: m[0] });
      }
    };

    proc.stdout.on("data", tryMatch);
    proc.stderr.on("data", tryMatch);
    proc.on("error", reject);
  });
}

function spawnDev(extraEnv = {}) {
  const env = {
    ...process.env,
    USE_API_PROXY: "true",
    NEXT_PUBLIC_API_URL: "/goodpath-api",
    HOSTNAME: "0.0.0.0",
    ...extraEnv,
  };

  return spawn(
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
    { cwd: root, env, stdio: "inherit" },
  );
}

execSync("node scripts/kill-dev.mjs", { cwd: root, stdio: "inherit" });

console.log("[goodpath] Starting web + API (API proxied at /goodpath-api) …\n");

const dev = spawnDev();

if (onlyApp) {
  console.log(`
Tunnel manually (new terminal):

  ngrok http ${port}
  cloudflared tunnel --url http://localhost:${port}

Set apps/web/.env.development.local:
  NEXT_PUBLIC_APP_URL=https://your-public-url

Then open that URL on laptop + phone (not localhost).
`);
  dev.on("exit", (c) => process.exit(c ?? 0));
} else {
  waitForPort(port)
    .then(async () => {
      if (which("cloudflared")) {
        console.log("\n[goodpath] Opening cloudflared tunnel (Ctrl+C stops everything)…\n");
        const { proc: tunnel, url } = await startCloudflaredTunnel();
        printPublicUrlBanner(url);
        persistPublicUrl(url);

        tunnel.on("exit", () => dev.kill("SIGTERM"));
        dev.on("exit", () => tunnel.kill("SIGTERM"));
        process.on("SIGINT", () => {
          tunnel.kill("SIGTERM");
          dev.kill("SIGTERM");
        });
        return;
      }

      if (which("ngrok")) {
        console.log("\n[goodpath] Opening ngrok tunnel (Ctrl+C stops everything)…\n");
        console.log(
          "Copy the https Forwarding URL from ngrok, set NEXT_PUBLIC_APP_URL, open it on laptop + phone.\n",
        );
        const tunnel = spawn("ngrok", ["http", String(port)], { stdio: "inherit" });
        tunnel.on("exit", () => dev.kill("SIGTERM"));
        dev.on("exit", () => tunnel.kill("SIGTERM"));
        process.on("SIGINT", () => {
          tunnel.kill("SIGTERM");
          dev.kill("SIGTERM");
        });
        return;
      }

      console.log(`
[goodpath] No tunnel CLI found. Install cloudflared or use LAN mode:

  pnpm dev:lan

Or install cloudflared and run:  pnpm dev:tunnel
`);
    })
    .catch((e) => {
      console.error(e.message);
      dev.kill("SIGTERM");
      process.exit(1);
    });

  dev.on("exit", (c) => process.exit(c ?? 0));
}

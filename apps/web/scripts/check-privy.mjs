#!/usr/bin/env node
/**
 * G$ Path — Privy setup helper (not an official Privy tool).
 * Run: pnpm --filter @goodpath/web privy:check
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...process.env, ...loadEnvLocal() };
const appId = env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  G$ Path — Privy setup (social login for Slice A)            ║
╚══════════════════════════════════════════════════════════════╝

Privy has NO official CLI to create apps. You use the web dashboard once,
then paste one line into .env.local. (Community scaffolds like create-privy-app
are for NEW projects — you already have G$ Path wired up.)

── Step 1: Dashboard (≈5 min) ─────────────────────────────────
  1. Open https://dashboard.privy.io and sign in (GitHub/Google is fine).
  2. Click "Create app" → name it "G$ Path dev" (or similar).
  3. Copy your App ID from:
     Configuration → App settings → Basics → App ID
     (starts with something like clxxxxxxxx... — safe to put in the browser)

── Step 2: Enable login methods ────────────────────────────────
  In the dashboard for YOUR app:
  • Login methods → turn ON: Email, Google, Wallet
  (Wallet = MetaMask; Email/Google = embedded wallet for users without MM)

── Step 3: Allow your URLs (important on phone/tunnel) ─────────
  • Configuration → App settings → Domains / Allowed origins
  • Add:
      http://localhost:3000
      http://127.0.0.1:3000
  • If you use pnpm dev:lan or dev:tunnel, also add that URL when you have it
    (e.g. http://192.168.x.x:3000 or https://xxxx.trycloudflare.com)

── Step 4: Embedded wallets on Ethereum ────────────────────────
  • Wallets → Embedded wallets → enable for Ethereum
  • We use Celo (EVM); Privy creates an EOA that works with wagmi on Celo.

── Step 5: Paste into apps/web/.env.local ─────────────────────
  NEXT_PUBLIC_PRIVY_APP_ID=paste-your-app-id-here

  Then restart: pnpm dev

── You do NOT need for G$ Path frontend ────────────────────────
  • App Secret (backend only — we don't use it yet)
  • @privy-io/agent-wallet-cli (that's for AI agents, not your app)

── Test flow ───────────────────────────────────────────────────
  Connect → Continue with Google OR MetaMask → Verify → Claim
  (GoodDollar topWallet runs automatically if CELO is low)

Docs: https://docs.privy.io/basics/get-started/dashboard/create-new-app
`);

if (appId.length > 0) {
  console.log(`✓ NEXT_PUBLIC_PRIVY_APP_ID is set (${appId.slice(0, 8)}…)\n`);
  console.log("  Social login should be active. Restart dev server if you just added it.\n");
} else {
  console.log("✗ NEXT_PUBLIC_PRIVY_APP_ID is not set in .env.local or the environment.\n");
  console.log(`  Create or edit: ${envPath}\n`);
  process.exitCode = 1;
}

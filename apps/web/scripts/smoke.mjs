#!/usr/bin/env node
/** Quick smoke test — run while dev server is up. */
const base = process.env.SMOKE_URL ?? "http://localhost:3000";

async function check(path) {
  const res = await fetch(`${base}${path}`);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.status;
}

try {
  await check("/api/health");
  await check("/goodpath-api/health");
  await check("/");
  console.log("smoke ok: /api/health, /goodpath-api/health, and / return 200");
} catch (e) {
  console.error("smoke failed:", e.message);
  process.exit(1);
}

import { networkInterfaces } from "node:os";

/** First non-internal IPv4 (typical home WiFi). */
export function getLanIp() {
  for (const addrs of Object.values(networkInterfaces())) {
    if (!addrs) continue;
    for (const a of addrs) {
      if (a.family === "IPv4" && !a.internal) return a.address;
    }
  }
  return null;
}

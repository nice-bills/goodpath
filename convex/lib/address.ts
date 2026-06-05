import { normalizeAddress } from "./dates";

const ADDRESS_RE = /^0x[a-f0-9]{40}$/;

/** Normalize and validate an EVM address (lowercase 0x + 40 hex). */
export function parseWalletAddress(address: string): string {
  const lower = normalizeAddress(address);
  if (!ADDRESS_RE.test(lower)) {
    throw new Error("Invalid address");
  }
  return lower;
}

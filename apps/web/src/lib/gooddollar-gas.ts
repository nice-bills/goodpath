import { celo } from "wagmi/chains";
import { createPublicClient, formatEther, http } from "viem";
import { SDK_ENV } from "@/lib/env";

/**
 * Minimum native CELO on Celo for one contract tx (claim / transfer).
 * 0.002 was too low — MetaMask often estimates ~0.01+ for claims.
 */
export const MIN_CELO_FOR_TX = 0.01;

/** Below this, warn that MetaMask may still reject the transaction. */
export const CELO_CAUTION_BELOW = 0.02;

const BACKENDS: Record<string, string> = {
  production: "https://goodserver.gooddollar.org",
  staging: "https://goodserver-qa.herokuapp.com",
  development: "https://good-server.herokuapp.com",
};

const publicClient = createPublicClient({
  chain: celo,
  transport: http(celo.rpcUrls.default.http[0]),
});

export const CELO_FAUCET_URL = "https://faucet.celo.org/";

const GAS_POLL_MS = 3_000;
const GAS_MAX_WAIT_MS = 60_000;

function backendUrl(): string {
  return BACKENDS[SDK_ENV] ?? BACKENDS.development;
}

/** GoodDollar backend can send a small CELO top-up (no wallet signature). */
export async function requestGoodDollarGasTopUp(account: `0x${string}`): Promise<void> {
  const res = await fetch(`${backendUrl()}/verify/topWallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chainId: celo.id, account }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Gas request failed (${res.status})`);
  }
}

export async function getCeloBalance(account: `0x${string}`): Promise<number> {
  const wei = await publicClient.getBalance({ address: account });
  return Number(formatEther(wei));
}

export function formatCeloAmount(balance: number): string {
  if (balance < 0.0001) return balance.toExponential(2);
  if (balance < 0.01) return balance.toFixed(6);
  return balance.toFixed(4);
}

export function hasEnoughCeloForTx(balance: number): boolean {
  return balance >= MIN_CELO_FOR_TX;
}

export function isBorderlineCeloForTx(balance: number): boolean {
  return balance >= MIN_CELO_FOR_TX && balance < CELO_CAUTION_BELOW;
}

export type EnsureGasResult =
  | { ok: true; balance: number; sponsored: boolean; borderline: boolean }
  | { ok: false; balance: number; error: string };

/**
 * Ensures the wallet has enough CELO for one Celo tx.
 * Requests GoodDollar topWallet when low, then polls until funded or timeout.
 */
export async function ensureGoodDollarGas(
  account: `0x${string}`,
  options?: { maxWaitMs?: number; pollMs?: number },
): Promise<EnsureGasResult> {
  const maxWaitMs = options?.maxWaitMs ?? GAS_MAX_WAIT_MS;
  const pollMs = options?.pollMs ?? GAS_POLL_MS;

  let balance = await getCeloBalance(account);
  if (hasEnoughCeloForTx(balance)) {
    return {
      ok: true,
      balance,
      sponsored: false,
      borderline: isBorderlineCeloForTx(balance),
    };
  }

  await requestGoodDollarGasTopUp(account);

  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, pollMs));
    balance = await getCeloBalance(account);
    if (hasEnoughCeloForTx(balance)) {
      return {
        ok: true,
        balance,
        sponsored: true,
        borderline: isBorderlineCeloForTx(balance),
      };
    }
  }

  return {
    ok: false,
    balance,
    error: `Need at least ${MIN_CELO_FOR_TX} CELO on Celo (you have ${formatCeloAmount(balance)}). GoodDollar gas can take up to a minute. Wait and retry, or use the Celo faucet.`,
  };
}

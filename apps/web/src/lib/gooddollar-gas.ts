import { celo } from "wagmi/chains";
import { formatEther } from "viem";
import { celoPublicClient } from "@/lib/celo-public-client";
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

export const CELO_FAUCET_URL = "https://faucet.celo.org/";

/** First polls are faster — GoodDollar often funds within a few seconds. */
const GAS_POLL_SCHEDULE_MS = [800, 1_200, 2_000, 3_000] as const;
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
  const wei = await celoPublicClient.getBalance({ address: account });
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
  options?: { maxWaitMs?: number; knownBalance?: number },
): Promise<EnsureGasResult> {
  const maxWaitMs = options?.maxWaitMs ?? GAS_MAX_WAIT_MS;

  let balance =
    options?.knownBalance !== undefined
      ? options.knownBalance
      : await getCeloBalance(account);
  if (hasEnoughCeloForTx(balance)) {
    return {
      ok: true,
      balance,
      sponsored: false,
      borderline: isBorderlineCeloForTx(balance),
    };
  }

  await requestGoodDollarGasTopUp(account);

  balance = await getCeloBalance(account);
  if (hasEnoughCeloForTx(balance)) {
    return {
      ok: true,
      balance,
      sponsored: true,
      borderline: isBorderlineCeloForTx(balance),
    };
  }

  const deadline = Date.now() + maxWaitMs;
  let pollIndex = 0;
  while (Date.now() < deadline) {
    const waitMs = GAS_POLL_SCHEDULE_MS[Math.min(pollIndex, GAS_POLL_SCHEDULE_MS.length - 1)];
    pollIndex += 1;
    await new Promise((r) => setTimeout(r, waitMs));
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

const gasInflight = new Map<string, Promise<EnsureGasResult>>();

/** One sponsorship flow per wallet — shared across claim, tip, and prefetch hooks. */
export function ensureGoodDollarGasShared(
  account: `0x${string}`,
  options?: { maxWaitMs?: number; knownBalance?: number },
): Promise<EnsureGasResult> {
  const key = account.toLowerCase();
  const existing = gasInflight.get(key);
  if (existing) return existing;

  const run = ensureGoodDollarGas(account, options).finally(() => {
    gasInflight.delete(key);
  });
  gasInflight.set(key, run);
  return run;
}

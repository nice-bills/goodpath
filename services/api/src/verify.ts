import {
  createPublicClient,
  decodeEventLog,
  http,
  parseAbi,
  parseUnits,
  zeroAddress,
  type Address,
  type Hash,
} from "viem";
import { createRequire } from "node:module";
import { celo } from "viem/chains";

// CJS entry avoids broken ESM re-export from lz-string in citizen-sdk
const requireSdk = createRequire(import.meta.url);
const {
  SupportedChains,
  chainConfigs,
  identityV2ABI,
  ubiSchemeV2ABI,
}: {
  SupportedChains: { CELO: number };
  chainConfigs: Record<
    number,
    {
      contracts: Record<
        string,
        {
          identityContract: Address;
          ubiContract: Address;
          g$Contract: Address;
        }
      >;
    }
  >;
  identityV2ABI: readonly unknown[];
  ubiSchemeV2ABI: readonly unknown[];
} = requireSdk("@goodsdks/citizen-sdk");

type contractEnv = "production" | "staging" | "development";
import {
  SUPPORT_ACK_META,
  type QuestId,
} from "@goodpath/shared";

const ERC20_TRANSFER = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

function contractEnvFromProcess(): contractEnv {
  const env = process.env.GOODDOLLAR_ENV ?? "development";
  if (env === "production" || env === "staging" || env === "development") {
    return env;
  }
  return "development";
}

function celoContracts() {
  const env = contractEnvFromProcess();
  const contracts = chainConfigs[SupportedChains.CELO].contracts[env];
  if (!contracts) throw new Error(`No Celo contracts for env ${env}`);
  return contracts;
}

const publicClient = createPublicClient({
  chain: celo,
  transport: http(
    process.env.CELO_RPC_URL ?? "https://forno.celo.org",
  ),
});

export async function verifyWhitelisted(user: Address): Promise<boolean> {
  const { identityContract } = celoContracts();
  const root = await publicClient.readContract({
    address: identityContract,
    abi: identityV2ABI,
    functionName: "getWhitelistedRoot",
    args: [user],
  });
  return root !== zeroAddress;
}

export async function verifyClaimTx(
  user: Address,
  txHash: Hash,
): Promise<boolean> {
  const { ubiContract } = celoContracts();
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== ubiContract.toLowerCase()) continue;
    try {
      const decoded = decodeUbiClaimed(log);
      if (decoded?.account.toLowerCase() === user.toLowerCase()) return true;
    } catch {
      /* try next log */
    }
  }

  return receipt.to?.toLowerCase() === ubiContract.toLowerCase();
}

function decodeUbiClaimed(log: {
  topics: readonly `0x${string}`[];
  data: `0x${string}`;
}) {
  const decoded = decodeEventLog({
    abi: ubiSchemeV2ABI,
    data: log.data,
    topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
  });
  if (decoded.eventName === "UBIClaimed") {
    const account = (decoded.args as Record<string, unknown>).account;
    if (typeof account !== "string") return null;
    return { account: account as Address };
  }
  return null;
}

export async function verifyTipTx(
  user: Address,
  txHash: Hash,
  tipRecipient: Address,
  minAmountWei: bigint,
): Promise<boolean> {
  const { g$Contract } = celoContracts();
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== g$Contract.toLowerCase()) continue;
    try {
      const event = decodeEventLog({
        abi: ERC20_TRANSFER,
        data: log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      if (event.eventName !== "Transfer") continue;
      const { from, to, value } = event.args;
      if (
        from.toLowerCase() === user.toLowerCase() &&
        to.toLowerCase() === tipRecipient.toLowerCase() &&
        value >= minAmountWei
      ) {
        return true;
      }
    } catch {
      /* continue */
    }
  }
  return false;
}

export async function validateQuestProof(
  questId: QuestId,
  user: Address,
  proof: { txHash?: string; meta?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  switch (questId) {
    case "connect":
      return { ok: true };

    case "verify": {
      const ok = await verifyWhitelisted(user);
      return ok
        ? { ok: true }
        : { ok: false, error: "Identity not whitelisted on-chain" };
    }

    case "claim": {
      if (!proof.txHash) {
        return { ok: false, error: "txHash required for claim quest" };
      }
      const ok = await verifyClaimTx(user, proof.txHash as Hash);
      return ok
        ? { ok: true }
        : { ok: false, error: "Invalid claim transaction" };
    }

    case "tip": {
      if (!proof.txHash) {
        return { ok: false, error: "txHash required for tip quest" };
      }
      const recipient = (process.env.TIP_RECIPIENT ??
        "0x0000000000000000000000000000000000000001") as Address;
      if (recipient === zeroAddress) {
        return { ok: false, error: "TIP_RECIPIENT not configured" };
      }
      const minG = process.env.MIN_TIP_G ?? "0.01";
      const minWei = parseUnits(minG, 18);
      const ok = await verifyTipTx(
        user,
        proof.txHash as Hash,
        recipient,
        minWei,
      );
      return ok
        ? { ok: true }
        : { ok: false, error: "Invalid G$ tip transaction" };
    }

    case "support": {
      if (proof.meta !== SUPPORT_ACK_META) {
        return {
          ok: false,
          error: 'Confirm you visited GoodCollective (ack required)',
        };
      }
      return { ok: true };
    }

    default:
      return { ok: false, error: "Unknown quest" };
  }
}

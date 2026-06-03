import { decodeFunctionData, parseAbi, parseUnits, type Hash } from "viem";
import {
  CFA_FORWARDER_ADDRESS,
  gPerMonthToFlowRate,
  parseHumanGToWei,
  PLACEHOLDER_ETH_ADDRESS,
  SAVINGS_STAKING_ADDRESS,
} from "@goodpath/shared";
import { celoContracts, publicClient, zeroAddress, type Address } from "./client.js";

const CREATE_FLOW_ABI = parseAbi([
  "function createFlow(address token, address sender, address receiver, int96 flowRate, bytes userData) returns (bool)",
]);

const STAKE_ABI = parseAbi(["function stake(uint256 amount)"]);

function streamRecipient(): Address | null {
  const raw = process.env.STREAM_RECIPIENT ?? process.env.TIP_RECIPIENT ?? "";
  const trimmed = raw.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  const addr = trimmed as Address;
  const lower = addr.toLowerCase();
  if (lower === zeroAddress || lower === PLACEHOLDER_ETH_ADDRESS) {
    return null;
  }
  return addr;
}

export async function verifyDeployStreamTx(
  user: Address,
  txHash: Hash,
  minFlowRate: bigint,
): Promise<boolean> {
  const recipient = streamRecipient();
  if (!recipient) return false;
  const { g$Contract } = celoContracts();

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  const tx = await publicClient.getTransaction({ hash: txHash });
  if (tx.to?.toLowerCase() !== CFA_FORWARDER_ADDRESS.toLowerCase()) {
    return false;
  }

  try {
    const decoded = decodeFunctionData({
      abi: CREATE_FLOW_ABI,
      data: tx.input,
    });
    if (decoded.functionName !== "createFlow") return false;
    const [token, sender, receiver, flowRate] = decoded.args as [
      Address,
      Address,
      Address,
      bigint,
      `0x${string}`,
    ];
    return (
      token.toLowerCase() === g$Contract.toLowerCase() &&
      sender.toLowerCase() === user.toLowerCase() &&
      receiver.toLowerCase() === recipient.toLowerCase() &&
      flowRate >= minFlowRate
    );
  } catch {
    return false;
  }
}

export async function verifyDeployStakeTx(
  user: Address,
  txHash: Hash,
  minAmountWei: bigint,
): Promise<boolean> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return false;

  const tx = await publicClient.getTransaction({ hash: txHash });
  if (tx.to?.toLowerCase() !== SAVINGS_STAKING_ADDRESS.toLowerCase()) {
    return false;
  }

  try {
    const decoded = decodeFunctionData({
      abi: STAKE_ABI,
      data: tx.input,
    });
    if (decoded.functionName !== "stake") return false;
    const amount = decoded.args[0] as bigint;
    return amount >= minAmountWei;
  } catch {
    return false;
  }
}

export function minDeployStakeWei(): bigint {
  return parseHumanGToWei(process.env.MIN_DEPLOY_G ?? "0.01");
}

export function minDeployStreamFlowRate(): bigint {
  const minG = process.env.MIN_STREAM_G_PER_MONTH ?? "0.01";
  return gPerMonthToFlowRate(minG);
}

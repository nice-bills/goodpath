import { decodeEventLog, parseAbi, type Hash, type Address } from "viem";
import { celoContracts, publicClient } from "./client.js";

const ERC20_TRANSFER = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

/** Sum G$ sent by `user` in a successful tx (tip, support, deploy proofs). */
export async function sumUserGsOutflowInTx(
  user: Address,
  txHash: Hash,
): Promise<bigint> {
  const { g$Contract } = celoContracts();
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return 0n;
  if (receipt.from.toLowerCase() !== user.toLowerCase()) return 0n;

  let total = 0n;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== g$Contract.toLowerCase()) continue;
    try {
      const event = decodeEventLog({
        abi: ERC20_TRANSFER,
        data: log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      if (event.eventName !== "Transfer") continue;
      const { from, value } = event.args;
      if (from.toLowerCase() === user.toLowerCase()) {
        total += value;
      }
    } catch {
      /* continue */
    }
  }
  return total;
}

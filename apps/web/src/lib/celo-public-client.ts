import { createPublicClient, http } from "viem";
import { celo } from "wagmi/chains";

const CELO_RPC = celo.rpcUrls.default.http[0]!;

export const celoPublicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

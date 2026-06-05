"use node";

import { createPublicClient, http, zeroAddress } from "viem";
import { celo } from "viem/chains";
import {
  celoContracts,
  identityV2ABI,
  ubiSchemeV2ABI,
} from "./gooddollar";

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org"),
});

export { celoContracts, identityV2ABI, ubiSchemeV2ABI, zeroAddress };
export type { Address } from "viem";

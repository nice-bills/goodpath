import { createPublicClient, http, zeroAddress, type Address } from "viem";
import { celo } from "viem/chains";
import {
  SupportedChains,
  chainConfigs,
  identityV2ABI,
  ubiSchemeV2ABI,
} from "@goodsdks/citizen-sdk";

type contractEnv = "production" | "staging" | "development";

function contractEnvFromProcess(): contractEnv {
  const env = process.env.GOODDOLLAR_ENV ?? "development";
  if (env === "production" || env === "staging" || env === "development") {
    return env;
  }
  return "development";
}

export function celoContracts() {
  const env = contractEnvFromProcess();
  const contracts = chainConfigs[SupportedChains.CELO].contracts[env];
  if (!contracts) throw new Error(`No Celo contracts for env ${env}`);
  return contracts;
}

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org"),
});

export { identityV2ABI, ubiSchemeV2ABI, zeroAddress };
export type { Address };

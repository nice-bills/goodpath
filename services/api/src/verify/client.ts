import { createPublicClient, http, zeroAddress, type Address } from "viem";
import { createRequire } from "node:module";
import { celo } from "viem/chains";

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

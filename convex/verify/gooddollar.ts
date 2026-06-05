"use node";

import { parseAbi, type Address } from "viem";

type ContractEnv = "production" | "staging" | "development";

export type CeloContracts = {
  identityContract: Address;
  ubiContract: Address;
  faucetContract: Address;
  g$Contract: Address;
};

/** Celo addresses from @goodsdks/citizen-sdk — inlined to avoid lz-string in Convex bundle. */
const CELO_CONTRACTS: Record<ContractEnv, CeloContracts> = {
  production: {
    identityContract: "0xC361A6E67822a0EDc17D899227dd9FC50BD62F42",
    ubiContract: "0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1",
    faucetContract: "0x4F93Fa058b03953C851eFaA2e4FC5C34afDFAb84",
    g$Contract: "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A",
  },
  staging: {
    identityContract: "0x0108BBc09772973aC27983Fc17c7D82D8e87ef4D",
    ubiContract: "0x2881d417dA066600372753E73A3570F0781f18cB",
    faucetContract: "0x9A0F8AEc626A0f493941Ceb1dA6021cFB0567293",
    g$Contract: "0x61FA0fB802fd8345C06da558240E0651886fec69",
  },
  development: {
    identityContract: "0xF25fA0D4896271228193E782831F6f3CFCcF169C",
    ubiContract: "0x6B86F82293552C3B9FE380FC038A89e0328C7C5f",
    faucetContract: "0x635b420e95b364def3A031166dA4bC4F57bf9dEB",
    g$Contract: "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475",
  },
};

export const identityV2ABI = parseAbi([
  "function getWhitelistedRoot(address account) view returns (address)",
]);

export const ubiSchemeV2ABI = parseAbi([
  "event UBIClaimed(address indexed account, uint256 amount)",
]);

export function contractEnvFromProcess(): ContractEnv {
  const env = process.env.GOODDOLLAR_ENV ?? "development";
  if (env === "production" || env === "staging" || env === "development") {
    return env;
  }
  return "development";
}

export function celoContracts(): CeloContracts {
  return CELO_CONTRACTS[contractEnvFromProcess()];
}

import {
  SupportedChains,
  chainConfigs,
  type contractEnv,
} from "@goodsdks/citizen-sdk";
import { SDK_ENV } from "./env";

export function celoscanContractUrl(address: string): string {
  return `https://celoscan.io/address/${address}`;
}

export function gDollarAddress(env: contractEnv = SDK_ENV): `0x${string}` | undefined {
  const contracts = chainConfigs[SupportedChains.CELO].contracts[env];
  return contracts?.g$Contract;
}

export const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

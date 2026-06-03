/** Unconfigured demo placeholder — must not be used for real transfers. */
export const PLACEHOLDER_ETH_ADDRESS =
  "0x0000000000000000000000000000000000000001" as const;

/** Superfluid CFAv1Forwarder (same on Celo mainnet). */
export const CFA_FORWARDER_ADDRESS =
  "0xcfA132E353cB4E398080B9700609bb008eceB125" as const;

/** GoodDollar Savings staking (@goodsdks/savings-sdk). */
export const SAVINGS_STAKING_ADDRESS =
  "0x799a23dA264A157Db6F9c02BE62F82CE8d602A45" as const;

const SECONDS_PER_MONTH = BigInt(30 * 24 * 60 * 60);

export function isConfiguredEthAddress(
  address: string | undefined | null,
): address is `0x${string}` {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  const lower = address.toLowerCase();
  return (
    lower !== "0x0000000000000000000000000000000000000000" &&
    lower !== PLACEHOLDER_ETH_ADDRESS
  );
}

/** Human G$ amount (e.g. "0.01") → wei (18 decimals). */
export function parseHumanGToWei(amountG: string): bigint {
  const trimmed = amountG.trim();
  const [whole, frac = ""] = trimmed.split(".");
  const wholePart = whole === "" ? 0n : BigInt(whole);
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  const fracPart = fracPadded.length > 0 ? BigInt(fracPadded) : 0n;
  return wholePart * 10n ** 18n + fracPart;
}

/** Superfluid flowRate (wei/sec) for a given G$ per month. */
export function gPerMonthToFlowRate(amountG: string): bigint {
  return parseHumanGToWei(amountG) / SECONDS_PER_MONTH;
}

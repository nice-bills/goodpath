import { celo } from "viem/chains";
import type { PrivyClientConfig } from "@privy-io/react-auth";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/** Social + embedded wallet on Celo when set in dashboard (https://dashboard.privy.io). */
export const isPrivyEnabled = PRIVY_APP_ID.length > 0;

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "google", "wallet"],
  appearance: {
    theme: "light",
    accentColor: "#00a979",
    logo: "/brand/mark.svg",
    walletList: ["metamask", "detected_ethereum_wallets", "wallet_connect"],
  },
  embeddedWallets: {
    ethereum: {
      // Whitelabel email/OAuth (loginWithCode) does NOT trigger createOnLogin — we call createWallet() after OTP.
      // https://docs.privy.io/basics/react/advanced/automatic-wallet-creation
      createOnLogin: "off",
    },
  },
  defaultChain: celo,
  supportedChains: [celo],
};

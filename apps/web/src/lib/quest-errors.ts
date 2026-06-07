/** User-facing copy for wallet / on-chain quest failures (not raw SDK strings). */

export type QuestErrorTone = "cancelled" | "error";

export type QuestErrorDisplay = {
  title: string;
  message: string;
  hint?: string;
  tone: QuestErrorTone;
};

function normalize(raw: string): string {
  return raw
    .replace(/^claim failed:\s*/i, "")
    .replace(/^tip failed:\s*/i, "")
    .trim();
}

function isUserCancelled(lower: string): boolean {
  return (
    lower.includes("user rejected") ||
    lower.includes("rejected the request") ||
    lower.includes("user denied") ||
    lower.includes("denied transaction") ||
    lower.includes("request rejected") ||
    lower.includes("action_rejected") ||
    lower.includes("cancelled") ||
    lower.includes("canceled")
  );
}

export function formatClaimError(raw: string): QuestErrorDisplay {
  const text = normalize(raw);
  const lower = text.toLowerCase();

  if (isUserCancelled(lower)) {
    return {
      tone: "cancelled",
      title: "Claim cancelled",
      message: "You declined the transaction in MetaMask. No G$ was moved.",
      hint: "Tap Claim again when you're ready. You may see one or two prompts (gas, then claim).",
    };
  }

  if (lower.includes("no ubi") || lower.includes("not entitled") || lower.includes("come back")) {
    return {
      tone: "error",
      title: "Nothing to claim yet",
      message: "Your daily UBI isn't available for this period.",
      hint: "GoodDollar resets on a schedule. Check back tomorrow or refresh entitlement above.",
    };
  }

  if (
    lower.includes("balance") ||
    lower.includes("gas") ||
    lower.includes("faucet") ||
    lower.includes("threshold") ||
    lower.includes("insufficient funds")
  ) {
    return {
      tone: "error",
      title: "Need CELO for gas",
      message: "Claims need a small amount of CELO to pay network fees.",
      hint: "Use Request gas from GoodDollar or the Celo faucet above, then try again.",
    };
  }

  if (lower.includes("whitelist") || lower.includes("identity") || lower.includes("verification")) {
    return {
      tone: "error",
      title: "Verify identity first",
      message: "Your wallet isn't verified for UBI on this network yet.",
      hint: "Complete the Verify quest, then return here to claim.",
    };
  }

  if (lower.includes("wrong chain") || lower.includes("chain") || lower.includes("network")) {
    return {
      tone: "error",
      title: "Wrong network",
      message: "Switch MetaMask to Celo, then try claiming again.",
    };
  }

  return {
    tone: "error",
    title: "Claim didn't go through",
    message: text.length > 0 && text.length < 200 ? text : "Something went wrong while claiming.",
    hint: "Check MetaMask for pending transactions, then tap Claim to retry.",
  };
}

export function formatDeployError(raw: string): QuestErrorDisplay {
  const text = normalize(raw);
  const lower = text.toLowerCase();

  if (isUserCancelled(lower)) {
    return {
      tone: "cancelled",
      title: "Transaction cancelled",
      message: "You declined the transaction in MetaMask. No G$ was moved.",
      hint: "Tap Save or Stream again when you're ready.",
    };
  }

  if (lower.includes("production") || lower.includes("mainnet")) {
    return {
      tone: "error",
      title: "Production only",
      message:
        text.length > 0 && text.length < 200
          ? text
          : "Save and stream are verified on Celo mainnet.",
    };
  }

  if (
    lower.includes("stream_recipient") ||
    lower.includes("tip_recipient") ||
    (lower.includes("recipient") && lower.includes("set"))
  ) {
    return {
      tone: "error",
      title: "Stream not configured",
      message: "This app needs a valid stream recipient address.",
      hint: "Set NEXT_PUBLIC_STREAM_RECIPIENT in the app environment.",
    };
  }

  if (lower.includes("g$ contract") || lower.includes("not configured")) {
    return {
      tone: "error",
      title: "G$ not configured",
      message:
        text.length > 0 && text.length < 200
          ? text
          : "G$ contract is not configured for this environment.",
    };
  }

  if (
    lower.includes("balance") ||
    lower.includes("gas") ||
    lower.includes("faucet") ||
    lower.includes("celo") ||
    lower.includes("threshold") ||
    lower.includes("insufficient funds")
  ) {
    return {
      tone: "error",
      title: "Need CELO for gas",
      message: "Saving or streaming G$ needs a small amount of CELO for network fees.",
      hint: "Use Request gas from GoodDollar or the Celo faucet above, then try again.",
    };
  }

  if (lower.includes("wrong chain") || lower.includes("chain") || lower.includes("network")) {
    return {
      tone: "error",
      title: "Wrong network",
      message: "Switch MetaMask to Celo, then try save or stream again.",
    };
  }

  if (
    lower.includes("stake failed") ||
    lower.includes("stream") ||
    lower.includes("proof") ||
    lower.includes("rejected")
  ) {
    return {
      tone: "error",
      title: "Deploy proof pending",
      message:
        text.length > 0 && text.length < 200
          ? text
          : "Your G$ may already be staked or streaming. We couldn't verify the transaction yet.",
      hint: "Check Celoscan for your transaction, then retry if needed.",
    };
  }

  return {
    tone: "error",
    title: "Deploy didn't go through",
    message:
      text.length > 0 && text.length < 200
        ? text
        : "Something went wrong while saving or streaming G$.",
    hint: "Confirm you're on Celo and have enough G$ and CELO for gas.",
  };
}

export function formatTipError(raw: string): QuestErrorDisplay {
  const text = normalize(raw);
  const lower = text.toLowerCase();

  if (isUserCancelled(lower)) {
    return {
      tone: "cancelled",
      title: "Tip cancelled",
      message: "You declined the transfer in MetaMask. No G$ was sent.",
      hint: "Tap Tip again when you're ready.",
    };
  }

  if (lower.includes("tip_recipient") || lower.includes("recipient")) {
    return {
      tone: "error",
      title: "Tip not configured",
      message: "This demo needs a valid tip recipient address.",
      hint: "Set NEXT_PUBLIC_TIP_RECIPIENT in the app environment.",
    };
  }

  if (
    lower.includes("invalid g$ tip") ||
    lower.includes("server error") ||
    lower.includes("transaction receipt") ||
    lower.includes("rejected transfer proof")
  ) {
    return {
      tone: "error",
      title: "Tip sent, proof pending",
      message:
        "Your G$ may already be on Celo. We tried to verify before the transaction finished mining.",
      hint: 'Tap "Confirm tip" below to retry without sending again.',
    };
  }

  return {
    tone: "error",
    title: "Tip didn't go through",
    message: text.length > 0 && text.length < 200 ? text : "The transfer could not be completed.",
    hint: "Confirm you're on Celo and have enough G$ and CELO for gas.",
  };
}

export function formatEntitlementError(raw: string): QuestErrorDisplay {
  const lower = raw.toLowerCase();
  return {
    tone: "error",
    title: "Couldn't check entitlement",
    message:
      lower.includes("network") || lower.includes("fetch")
        ? "We couldn't reach the UBI contract. Is the API up and your wallet on Celo?"
        : normalize(raw) || "Try refreshing in a moment.",
    hint: "Run pnpm dev from the project root if you're developing locally.",
  };
}

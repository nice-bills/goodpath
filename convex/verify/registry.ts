"use node";

import type { Hash } from "viem";
import {
  DEPLOY_SAVE_META,
  DEPLOY_STREAM_META,
  SUPPORT_ACK_META,
  validateQuestProofBody,
  type QuestId,
  type QuestProofInput,
} from "@goodpath/shared";
import { zeroAddress, type Address } from "./client";
import { verifyClaimTx, verifyWhitelisted } from "./identity";
import {
  minSupportWei,
  minTipWei,
  supportRecipients,
  verifyGsTransferTx,
  verifyTipTx,
} from "./transfer";
import {
  minDeployStakeWei,
  minDeployStreamFlowRate,
  verifyDeployStakeTx,
  verifyDeployStreamTx,
} from "./deploy";

export type ProofResult = { ok: true } | { ok: false; error: string };

type QuestVerifier = (
  user: Address,
  proof: QuestProofInput,
) => Promise<ProofResult>;

const verifiers: Record<QuestId, QuestVerifier> = {
  connect: async () => ({ ok: true }),

  verify: async (user) => {
    const ok = await verifyWhitelisted(user);
    return ok
      ? { ok: true }
      : { ok: false, error: "Identity not whitelisted on-chain" };
  },

  claim: async (user, proof) => {
    if (!proof.txHash) {
      return { ok: false, error: "txHash required for claim quest" };
    }
    const ok = await verifyClaimTx(user, proof.txHash as Hash);
    return ok
      ? { ok: true }
      : { ok: false, error: "Invalid claim transaction" };
  },

  tip: async (user, proof) => {
    if (!proof.txHash) {
      return { ok: false, error: "txHash required for tip quest" };
    }
    const recipient = (process.env.TIP_RECIPIENT ??
      "0x0000000000000000000000000000000000000001") as Address;
    if (recipient === zeroAddress) {
      return { ok: false, error: "TIP_RECIPIENT not configured" };
    }
    const ok = await verifyTipTx(
      user,
      proof.txHash as Hash,
      recipient,
      minTipWei(),
    );
    return ok
      ? { ok: true }
      : { ok: false, error: "Invalid G$ tip transaction" };
  },

  support: async (user, proof) => {
    if (proof.txHash) {
      const recipients = supportRecipients();
      if (recipients.length === 0) {
        return {
          ok: false,
          error: "SUPPORT_RECIPIENT not configured on API",
        };
      }
      const ok = await verifyGsTransferTx(
        user,
        proof.txHash as Hash,
        recipients,
        minSupportWei(),
      );
      return ok
        ? { ok: true }
        : {
            ok: false,
            error:
              "Invalid G$ support transfer — send to a configured pool address",
          };
    }
    if (proof.meta === SUPPORT_ACK_META) {
      return { ok: true };
    }
    return {
      ok: false,
      error: "Send G$ to a GoodCollective pool (txHash) or confirm visit (ack)",
    };
  },

  deploy: async (user, proof) => {
    if (!proof.txHash) {
      return { ok: false, error: "txHash required for deploy quest" };
    }
    const mode = proof.meta ?? DEPLOY_SAVE_META;
    if (mode === DEPLOY_STREAM_META) {
      const ok = await verifyDeployStreamTx(
        user,
        proof.txHash as Hash,
        minDeployStreamFlowRate(),
      );
      return ok
        ? { ok: true }
        : {
            ok: false,
            error:
              "Invalid G$ stream — use Superfluid createFlow on Celo mainnet",
          };
    }
    if (mode !== DEPLOY_SAVE_META) {
      return { ok: false, error: "Unknown deploy mode" };
    }
    const ok = await verifyDeployStakeTx(
      user,
      proof.txHash as Hash,
      minDeployStakeWei(),
    );
    return ok
      ? { ok: true }
      : {
          ok: false,
          error: "Invalid G$ stake — use GoodDollar Savings (stake on Celo)",
        };
  },
};

export async function validateQuestProof(
  questId: QuestId,
  user: Address,
  proof: QuestProofInput,
): Promise<ProofResult> {
  const bodyError = validateQuestProofBody(questId, proof);
  if (bodyError) {
    return { ok: false, error: bodyError };
  }

  const verify = verifiers[questId];
  if (!verify) {
    return { ok: false, error: "Unknown quest" };
  }
  return verify(user, proof);
}

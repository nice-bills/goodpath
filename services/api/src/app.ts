import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Address } from "viem";
import {
  QUESTS,
  addressSchema,
  completeQuestBodySchema,
  questIdSchema,
  type QuestId,
} from "@goodpath/shared";
import {
  buildProfilePayload,
  completeQuest,
  getImpactStats,
  QuestPrerequisiteError,
  setReferrer,
  getRepositories,
} from "./db.js";
import { validateQuestProof } from "./verify/index.js";
import { recordQuestOnChain, recordReferralOnChain } from "./chain/receipt.js";
import { proofTypeForQuest } from "./domain/proof-type.js";

export const goodpathApi = new Hono();

const corsOrigins = (
  process.env.CORS_ORIGINS ??
  "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

goodpathApi.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (corsOrigins.includes(origin)) return origin;
      if (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) {
        return origin;
      }
      if (origin.endsWith(".vercel.app")) return origin;
      return corsOrigins[0] ?? origin;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

goodpathApi.get("/health", (c) =>
  c.json({
    ok: true,
    service: "goodpath-api",
    database: process.env.DATABASE_PROVIDER ?? "sqlite",
  }),
);

goodpathApi.get("/api/quests", (c) => c.json({ quests: QUESTS }));

goodpathApi.get("/api/stats", (c) => {
  try {
    return c.json(getImpactStats());
  } catch (e) {
    console.error("[stats]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

goodpathApi.get("/api/profile/:address", async (c) => {
  try {
    const parsed = addressSchema.safeParse(c.req.param("address"));
    if (!parsed.success) {
      return c.json({ error: "Invalid address" }, 400);
    }
    return c.json(await buildProfilePayload(parsed.data));
  } catch (e) {
    console.error("[profile GET]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

goodpathApi.get("/api/profile/:address/receipt", async (c) => {
  try {
    const parsed = addressSchema.safeParse(c.req.param("address"));
    if (!parsed.success) {
      return c.json({ error: "Invalid address" }, 400);
    }
    const payload = await buildProfilePayload(parsed.data);
    const { receipt } = getRepositories();
    const events = receipt.listReceiptEvents(parsed.data, 10);
    return c.json({
      address: payload.address,
      pathCompletedAt: payload.pathCompletedAt,
      league: payload.league,
      chainProofs: payload.chainProofs,
      publicCard: payload.publicCard,
      referredBy: payload.referredBy,
      events: events.map((e) => ({
        kind: e.kind,
        payload: JSON.parse(e.payload) as Record<string, unknown>,
        createdAt: e.created_at,
      })),
    });
  } catch (e) {
    console.error("[receipt GET]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

goodpathApi.post("/api/profile/:address/referral", async (c) => {
  const addressResult = addressSchema.safeParse(c.req.param("address"));
  if (!addressResult.success) {
    return c.json({ error: "Invalid address" }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const referrerResult = addressSchema.safeParse(
    typeof body === "object" && body !== null && "referrer" in body
      ? (body as { referrer: string }).referrer
      : "",
  );
  if (!referrerResult.success) {
    return c.json({ error: "Invalid referrer address" }, 400);
  }

  const result = setReferrer(addressResult.data, referrerResult.data);
  if (!result.ok) {
    return c.json({ error: result.error }, 409);
  }

  void recordReferralOnChain(
    referrerResult.data as Address,
    addressResult.data as Address,
  ).catch((e) => console.error("[receipt] referral", e));

  getRepositories().receipt.appendReceiptEvent(addressResult.data, "referral_set", {
    referrer: referrerResult.data,
  });

  return c.json({ ok: true });
});

goodpathApi.post("/api/profile/:address/share-invite", async (c) => {
  const addressResult = addressSchema.safeParse(c.req.param("address"));
  if (!addressResult.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const invite = getRepositories().receipt.createShareInvite(addressResult.data);
  return c.json({
    code: invite.code,
    referrer: invite.referrer_address,
    shareUrl: `/r/${invite.code}`,
  });
});

goodpathApi.get("/api/profile/:address/rival", async (c) => {
  const parsed = addressSchema.safeParse(c.req.param("address"));
  if (!parsed.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const rival = getRepositories().social.getRival(parsed.data);
  if (!rival) {
    return c.json({ rival: null });
  }
  return c.json({
    rival: {
      address: rival.rival_address,
      label: rival.rival_label,
      isSeeded: Boolean(rival.is_seeded),
    },
  });
});

goodpathApi.post("/api/profile/:address/rival", async (c) => {
  const userResult = addressSchema.safeParse(c.req.param("address"));
  if (!userResult.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const body = await c.req.json().catch(() => ({}));
  const rivalResult = addressSchema.safeParse(
    typeof body === "object" && body !== null && "rival" in body
      ? (body as { rival: string }).rival
      : "",
  );
  if (!rivalResult.success) {
    return c.json({ error: "Invalid rival address" }, 400);
  }
  if (userResult.data.toLowerCase() === rivalResult.data.toLowerCase()) {
    return c.json({ error: "Cannot rival yourself" }, 400);
  }
  getRepositories().social.setRival(userResult.data, rivalResult.data, null, false);
  return c.json({ ok: true });
});

goodpathApi.get("/api/profile/:address/squads", async (c) => {
  const parsed = addressSchema.safeParse(c.req.param("address"));
  if (!parsed.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const memberships = getRepositories().social.listSquadMemberships(parsed.data);
  return c.json({
    squads: memberships,
    stub: true,
    message: "Squad scoring ships in v2 — data model ready",
  });
});

goodpathApi.post("/api/profile/:address/squads/join", async (c) => {
  const parsed = addressSchema.safeParse(c.req.param("address"));
  if (!parsed.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const body = await c.req.json().catch(() => ({}));
  const squadId =
    typeof body === "object" && body !== null && "squadId" in body
      ? String((body as { squadId: string }).squadId)
      : "goodpath-demo-squad";
  const row = getRepositories().social.stubJoinSquad(parsed.data, squadId);
  return c.json({ ok: true, membership: row, stub: true });
});

goodpathApi.post("/api/profile/:address/quests/:questId/complete", async (c) => {
  const addressResult = addressSchema.safeParse(c.req.param("address"));
  if (!addressResult.success) {
    return c.json({ error: "Invalid address" }, 400);
  }
  const address = addressResult.data as Address;

  const questResult = questIdSchema.safeParse(c.req.param("questId"));
  if (!questResult.success) {
    return c.json({ error: "Unknown quest" }, 400);
  }
  const questId = questResult.data as QuestId;

  const body = completeQuestBodySchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!body.success) {
    return c.json({ error: body.error.flatten() }, 400);
  }

  const proof = await validateQuestProof(questId, address, {
    txHash: body.data.txHash,
    meta: body.data.meta,
  });
  if (!proof.ok) {
    return c.json({ error: proof.error }, 422);
  }

  try {
    const result = completeQuest(
      address,
      questId,
      body.data.txHash,
      body.data.meta,
    );

    const proofType = proofTypeForQuest(
      questId,
      body.data.meta,
      Boolean(body.data.txHash),
    );
    getRepositories().league.recordProofEvent(
      address,
      questId,
      proofType,
      body.data.txHash ?? null,
      body.data.meta ?? null,
    );

    getRepositories().receipt.appendReceiptEvent(address, "quest_complete", {
      questId,
      proofType,
      txHash: body.data.txHash ?? null,
    });

    void recordQuestOnChain(address, questId, body.data.txHash).catch((e) =>
      console.error("[receipt] background write failed", e),
    );

    const payload = await buildProfilePayload(address);

    return c.json({
      ok: true,
      streak: result.streak,
      pathComplete: result.pathComplete,
      profile: {
        streak: payload.streak,
        pathCompletedAt: payload.pathCompletedAt,
        progress: payload.progress,
      },
    });
  } catch (e) {
    if (e instanceof QuestPrerequisiteError) {
      return c.json(
        { error: e.message, missingQuest: e.missing },
        403,
      );
    }
    console.error("[quest complete]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

goodpathApi.onError((err, c) => {
  console.error("[unhandled]", err);
  return c.json({ error: "Internal server error" }, 500);
});

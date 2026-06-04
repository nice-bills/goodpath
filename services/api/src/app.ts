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
} from "./db.js";
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

goodpathApi.get("/health", (c) => c.json({ ok: true, service: "goodpath-api" }));

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

  return c.json({ ok: true });
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

  const { validateQuestProof } = await import("./verify/index.js");
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

    const { recordQuestOnChain } = await import("./chain/receipt.js");
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

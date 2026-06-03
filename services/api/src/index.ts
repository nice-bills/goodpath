import { serve } from "@hono/node-server";
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
} from "./db.js";
import { validateQuestProof } from "./verify/index.js";

const app = new Hono();

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/api/quests", (c) => c.json({ quests: QUESTS }));

app.get("/api/stats", (c) => {
  try {
    return c.json(getImpactStats());
  } catch (e) {
    console.error("[stats]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/profile/:address", (c) => {
  try {
    const parsed = addressSchema.safeParse(c.req.param("address"));
    if (!parsed.success) {
      return c.json({ error: "Invalid address" }, 400);
    }
    return c.json(buildProfilePayload(parsed.data));
  } catch (e) {
    console.error("[profile GET]", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/api/profile/:address/quests/:questId/complete", async (c) => {
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
    const payload = buildProfilePayload(address);

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

app.onError((err, c) => {
  console.error("[unhandled]", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";
console.log(`G$ Path API http://${host === "0.0.0.0" ? "localhost" : host}:${port} (listen ${host})`);
serve({ fetch: app.fetch, port, hostname: host });

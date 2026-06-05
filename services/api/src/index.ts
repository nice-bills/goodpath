import { serve } from "@hono/node-server";
import { goodpathApi } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";
console.log(
  `G$ Path API http://${host === "0.0.0.0" ? "localhost" : host}:${port} (listen ${host})`,
);
serve({ fetch: goodpathApi.fetch, port, hostname: host });

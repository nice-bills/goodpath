import { handle } from "hono/vercel";
import { goodpathApi } from "@goodpath/api/app";

const honoHandler = handle(goodpathApi);

const API_MOUNT = "/goodpath-api";

/** Next serves this app under `/goodpath-api/*`; Hono routes are rooted at `/`. */
function toHonoRequest(request: Request): Request {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(API_MOUNT)) {
    return request;
  }
  const subPath = url.pathname.slice(API_MOUNT.length) || "/";
  return new Request(new URL(subPath + url.search, url.origin), request);
}

export function runGoodpathApi(request: Request): Response | Promise<Response> {
  return honoHandler(toHonoRequest(request));
}

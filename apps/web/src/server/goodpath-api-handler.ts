const API_MOUNT = "/goodpath-api";

function isHonoApiEnabled(): boolean {
  return (
    process.env.GOODPATH_USE_HONO_API === "1" ||
    process.env.NEXT_PUBLIC_GOODPATH_USE_HONO_API === "1"
  );
}

/** Next serves this app under `/goodpath-api/*`; Hono routes are rooted at `/`. */
function toHonoRequest(request: Request): Request {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(API_MOUNT)) {
    return request;
  }
  const subPath = url.pathname.slice(API_MOUNT.length) || "/";
  return new Request(new URL(subPath + url.search, url.origin), request);
}

type HonoHandler = (request: Request) => Response | Promise<Response>;

let honoHandler: HonoHandler | null = null;

async function loadHonoHandler(): Promise<HonoHandler> {
  if (!honoHandler) {
    const { handle } = await import("hono/vercel");
    const { goodpathApi } = await import("@goodpath/api/app");
    honoHandler = handle(goodpathApi);
  }
  return honoHandler;
}

export async function runGoodpathApi(request: Request): Promise<Response> {
  if (!isHonoApiEnabled()) {
    return Response.json(
      {
        error:
          "Legacy /goodpath-api is disabled. App state is served by Convex (NEXT_PUBLIC_CONVEX_URL).",
      },
      { status: 410, headers: { "Content-Type": "application/json" } },
    );
  }
  const handler = await loadHonoHandler();
  return handler(toHonoRequest(request));
}

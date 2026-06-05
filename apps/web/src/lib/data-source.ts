/** When true, web hooks call the legacy Hono API instead of Convex. */
export const USE_HONO_API =
  process.env.NEXT_PUBLIC_GOODPATH_USE_HONO_API === "1" ||
  process.env.GOODPATH_USE_HONO_API === "1";

export function isHonoApiEnabled(): boolean {
  return USE_HONO_API;
}

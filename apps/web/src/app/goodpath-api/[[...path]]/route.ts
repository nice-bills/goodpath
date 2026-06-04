export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { runGoodpathApi } from "@/server/goodpath-api-handler";

export async function GET(request: Request) {
  return runGoodpathApi(request);
}

export async function POST(request: Request) {
  return runGoodpathApi(request);
}

export async function OPTIONS(request: Request) {
  return runGoodpathApi(request);
}

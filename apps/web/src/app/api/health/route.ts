import { NextResponse } from "next/server";

/** Lightweight check — no wagmi, no wallet SDKs. */
export function GET() {
  return NextResponse.json({ ok: true, service: "goodpath-web" });
}

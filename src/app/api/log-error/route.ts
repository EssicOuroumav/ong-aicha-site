import { NextResponse } from "next/server";
import { logError } from "@/lib/errorlog";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";

// Reçoit les erreurs affichées dans le navigateur (page d'erreur). Limité, de même origine, sans données personnelles.
export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await rateLimit(`logerr:${await clientIp()}`, 10, 10 * 60 * 1000))) return NextResponse.json({ ok: false }, { status: 429 });
  const text = await request.text();
  if (text.length > 4000) return NextResponse.json({ ok: false }, { status: 413 });
  try {
    const b = JSON.parse(text) as { message?: unknown; path?: unknown; digest?: unknown };
    await logError({ source: "client", path: String(b.path ?? "/"), message: String(b.message ?? "Erreur navigateur"), digest: b.digest ? String(b.digest) : undefined });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

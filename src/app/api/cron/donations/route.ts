import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncDonation } from "@/lib/donations";
import { donationWindow, MAX_PER_RUN } from "@/lib/donationSync";
import { purgeRateLimits } from "@/lib/ratelimit";

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Rattrapage quotidien (Vercel Cron, Authorization: Bearer CRON_SECRET) : un don resté « en attente » (IPN manquée, donateur parti avant
// le retour) est revérifié auprès de PayDunya, qui reste la seule source de vérité. Ne renvoie que des totaux.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return new NextResponse("Service Unavailable", { status: 503 });
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!safeEqual(given, secret)) return new NextResponse("Unauthorized", { status: 401 });

  const { olderThan, newerThan } = donationWindow();
  const pending = await db.donation.findMany({
    where: { status: "PENDING", provider: "paydunya", providerToken: { not: null }, createdAt: { lte: olderThan, gte: newerThan } },
    orderBy: { createdAt: "asc" },
    take: MAX_PER_RUN,
    select: { reference: true },
  });
  const totals = { checked: 0, completed: 0, cancelled: 0, failed: 0, still_pending: 0, errors: 0 };
  for (const d of pending) {
    totals.checked++;
    try {
      const r = await syncDonation(d.reference);
      if (r?.status === "COMPLETED") totals.completed++;
      else if (r?.status === "CANCELLED") totals.cancelled++;
      else if (r?.status === "FAILED") totals.failed++;
      else totals.still_pending++;
    } catch (e) {
      totals.errors++;
      console.error("[cron donations]", d.reference, e);
    }
  }
  const stale = await db.donation.count({ where: { status: "PENDING", provider: "paydunya", providerToken: { not: null }, createdAt: { lt: newerThan } } });
  const purged = await purgeRateLimits().catch(() => 0);
  return NextResponse.json({ ok: true, ...totals, stale, purgedRateLimits: purged });
}

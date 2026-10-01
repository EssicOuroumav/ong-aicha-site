import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSponsorshipReminder } from "@/lib/sponsorship";

// Appelé chaque jour par Vercel Cron (header Authorization: Bearer CRON_SECRET)
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const due = await db.sponsorship.findMany({ where: { status: "APPROVED", amount: { not: null }, nextDueAt: { lte: new Date() } } });
  const results = [];
  for (const s of due) results.push({ id: s.id, ...(await sendSponsorshipReminder(s.id, origin)) });
  return NextResponse.json({ processed: results.length, results });
}

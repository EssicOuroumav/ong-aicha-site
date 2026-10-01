import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncDonation } from "@/lib/donations";

// Notification serveur de PayDunya. On ne fait jamais confiance au contenu reçu :
// on relit le statut réel auprès de PayDunya via le token.
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let token: string | undefined;
    try {
      const json = JSON.parse(raw);
      token = json?.data?.invoice?.token ?? json?.invoice?.token;
    } catch {
      const params = new URLSearchParams(raw);
      token = params.get("data[invoice][token]") ?? undefined;
    }
    if (!token) return NextResponse.json({ ok: false }, { status: 400 });
    const donation = await db.donation.findFirst({ where: { providerToken: token } });
    if (!donation) return NextResponse.json({ ok: false }, { status: 404 });
    await syncDonation(donation.reference);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ipn]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

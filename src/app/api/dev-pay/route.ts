import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReceipt } from "@/lib/donations";

// Simulateur de paiement : UNIQUEMENT en développement, sans clés PayDunya.
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") ?? "";
  const lang = url.searchParams.get("lang") ?? "fr";
  await db.donation.update({ where: { reference: ref }, data: { status: "COMPLETED" } });
  await sendReceipt(ref);
  return NextResponse.redirect(new URL(`/${lang}/donate/result?ref=${ref}`, url.origin));
}

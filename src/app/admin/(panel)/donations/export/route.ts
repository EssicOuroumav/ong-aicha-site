import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { can } from "@/lib/guard";

const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise l'injection de formules Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.mustChangePw || !can(session.user.role, "donations")) return new NextResponse("Forbidden", { status: 403 });
  const rows = await db.donation.findMany({ orderBy: { createdAt: "desc" } });
  const head = ["Date", "Référence", "Nom", "E-mail", "Téléphone", "Pays", "Montant", "Devise", "Cause", "Statut", "Anonyme"];
  const lines = rows.map((d) => [d.createdAt.toISOString(), d.reference, d.donorName, d.email, d.phone, d.country, d.amount, d.currency, d.cause, d.status, d.anonymous ? "oui" : "non"].map(cell).join(","));
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="dons-aicha.csv"' } });
}

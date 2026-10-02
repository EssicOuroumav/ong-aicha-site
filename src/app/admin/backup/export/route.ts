import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/guard";
import { buildBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.mustChangePw || !can(session.user.role, "settings")) return new NextResponse("Forbidden", { status: 403 });
  const backup = await buildBackup(db);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="sauvegarde-aicha-${stamp}.json"`, "Cache-Control": "no-store" },
  });
}

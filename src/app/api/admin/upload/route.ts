import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { can } from "@/lib/guard";

const allowed = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.mustChangePw || !can(session.user.role, "content")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Stockage non configuré" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Format non autorisé (JPEG, PNG ou WebP)" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Fichier trop lourd (5 Mo max)" }, { status: 400 });
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
  const blob = await put(`uploads/${Date.now()}-${safe}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}

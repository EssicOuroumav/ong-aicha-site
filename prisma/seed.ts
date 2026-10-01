import { config } from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const read = <T>(f: string): T[] => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : []);

async function main() {
  // Compte super-administrateur initial (mot de passe temporaire, à changer à la 1re connexion)
  const email = (process.env.SEED_ADMIN_EMAIL ?? "ongaicha2022@gmail.com").toLowerCase();
  if (!(await db.user.findUnique({ where: { email } }))) {
    const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
    await db.user.create({
      data: { email, name: "Administrateur", role: "SUPER_ADMIN", mustChangePw: true, passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`\n=== Compte admin créé ===\nE-mail : ${email}\nMot de passe temporaire : ${password}\n(à changer dès la première connexion)\n`);
  } else {
    console.log("Compte admin déjà présent : inchangé.");
  }

  type A = { slug: string; order: number; coverImage: string; title: object; summary: object; description: object; period: object | null; location: string | null };
  for (const a of read<A>("prisma/seed-data/activities.json")) {
    await db.activity.upsert({ where: { slug: a.slug }, update: {}, create: { ...a, period: a.period ?? undefined, published: true } });
  }
  type P = { slug: string; publishedAt: string; coverImage: string; title: object; excerpt: object; content: object };
  for (const p of read<P>("prisma/seed-data/posts.json")) {
    await db.post.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, publishedAt: new Date(p.publishedAt), published: true } });
  }
  type M = { url: string; album: string; caption: object; kind: "PHOTO" | "VIDEO" };
  const media = read<M>("prisma/seed-data/gallery.json");
  if (media.length && (await db.mediaItem.count()) === 0) {
    await db.mediaItem.createMany({ data: media.map((m, i) => ({ ...m, order: i })) });
  }
  console.log("Seed terminé.");
}

main().finally(() => db.$disconnect());

import { config } from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseUrl } from "../src/lib/dburl";

config({ path: ".env.local" });
config();

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl() }) });
const read = <T>(f: string): T[] => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : []);

async function main() {
  console.log(`Base ciblée : ${process.env.PRISMA_TARGET === "production" ? "PRODUCTION" : "test (développement)"}`);
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
  // Enrichissements : catégories, chiffres d'impact et nouveaux programmes issus de l'ancien site
  type Extra = { newActivities: (A & { category: string })[]; categories: Record<string, string>; impact: Record<string, object[]> };
  const extra: Extra | null = existsSync("prisma/seed-data/activities.additions.json") ? JSON.parse(readFileSync("prisma/seed-data/activities.additions.json", "utf8")) : null;
  if (extra) {
    // Première installation seulement : on ne ré-active pas ce que l'admin a retiré du bandeau
    if ((await db.activity.count({ where: { featured: true } })) === 0) {
      await db.activity.updateMany({
        where: { slug: { in: ["paniers-du-ramadan", "habits-neufs-tabaski", "en-route-pour-l-ecole", "vague-rose-et-rouge", "classe-rose", "cliniques-mobiles", "journee-d-excellence"] } },
        data: { featured: true },
      });
    }
    for (const [slug, category] of Object.entries(extra.categories)) await db.activity.updateMany({ where: { slug }, data: { category } });
    for (const [slug, impact] of Object.entries(extra.impact)) await db.activity.updateMany({ where: { slug }, data: { impact } });
    for (const a of extra.newActivities) {
      await db.activity.upsert({ where: { slug: a.slug }, update: {}, create: { ...a, period: undefined, location: null, published: true } });
    }
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

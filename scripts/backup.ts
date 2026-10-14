// Sauvegarde JSON de la base : `npm run db:backup` (test) ou `npm run db:backup:prod` (production).
import { config } from "dotenv";
import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseUrl } from "../src/lib/dburl";
import { readFileSync } from "node:fs";
import { buildBackup, verifyBackup } from "../src/lib/backup";

config({ path: ".env.local" });

// Vérification d'une sauvegarde : `npm run db:backup -- --check <fichier>`
if (process.argv[2] === "--check") {
  const file = process.argv[3];
  if (!file) { console.error("Usage : npm run db:backup -- --check <fichier de sauvegarde>"); process.exit(2); }
  let problems: string[];
  try { problems = verifyBackup(JSON.parse(readFileSync(file, "utf8"))); } catch { problems = ["fichier illisible"]; }
  console.log(problems.length ? `Sauvegarde NON fiable :\n- ${problems.join("\n- ")}` : "Sauvegarde intacte (format, totaux et absence de mots de passe vérifiés).");
  process.exit(problems.length ? 1 : 0);
}

const target = process.env.PRISMA_TARGET === "production" ? "production" : "test";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl() }) });

(async () => {
  const dir = process.env.BACKUP_DIR ?? join(homedir(), "Desktop", "ONG AICHA", "sauvegardes");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const backup = await buildBackup(db);
  const file = join(dir, `aicha-${target}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(backup, null, 2), { mode: 0o600 });
  chmodSync(file, 0o600);
  console.log(`Sauvegarde (${target}) : ${file}`);
  console.log(JSON.stringify(backup.counts));
  await db.$disconnect();
})();

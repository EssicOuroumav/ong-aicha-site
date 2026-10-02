// Sauvegarde JSON de la base : `npm run db:backup` (test) ou `npm run db:backup:prod` (production).
import { config } from "dotenv";
import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseUrl } from "../src/lib/dburl";
import { buildBackup } from "../src/lib/backup";

config({ path: ".env.local" });
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

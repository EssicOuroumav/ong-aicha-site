import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/lib/dburl";

config({ path: ".env.local" });
config();

// Par défaut : base de TEST. Pour la production, lancer explicitement avec PRISMA_TARGET=production.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: databaseUrl(process.env, { unpooled: true }) },
});

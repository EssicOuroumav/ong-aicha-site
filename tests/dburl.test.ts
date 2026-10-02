import { describe, expect, it } from "vitest";
import { databaseUrl } from "@/lib/dburl";

const env = { DATABASE_URL: "postgres://prod", DATABASE_URL_UNPOOLED: "postgres://prod-direct", DEV_DATABASE_URL: "postgres://dev", DEV_DATABASE_URL_UNPOOLED: "postgres://dev-direct" };

describe("choix de la base de données", () => {
  it("production Vercel → base de production", () => {
    expect(databaseUrl({ ...env, VERCEL_ENV: "production" })).toBe("postgres://prod");
    expect(databaseUrl({ ...env, VERCEL_ENV: "production" }, { unpooled: true })).toBe("postgres://prod-direct");
  });
  it("aperçu Vercel et poste local → base de test", () => {
    expect(databaseUrl({ ...env, VERCEL_ENV: "preview" })).toBe("postgres://dev");
    expect(databaseUrl({ ...env })).toBe("postgres://dev");
    expect(databaseUrl({ ...env }, { unpooled: true })).toBe("postgres://dev-direct");
  });
  it("la production n'est atteinte localement que sur demande explicite", () => {
    expect(databaseUrl({ ...env, PRISMA_TARGET: "production" })).toBe("postgres://prod");
  });
  it("sans base de test, hors production : erreur, jamais de repli vers la production", () => {
    expect(() => databaseUrl({ DATABASE_URL: "postgres://prod" })).toThrow(/DEV_DATABASE_URL/);
    expect(() => databaseUrl({ DATABASE_URL: "postgres://prod", VERCEL_ENV: "preview" })).toThrow();
  });
});

import { paymentsEnabled } from "@/lib/paydunya";
describe("paiement en ligne", () => {
  const keys = { PAYDUNYA_MASTER_KEY: "a", PAYDUNYA_PRIVATE_KEY: "b", PAYDUNYA_TOKEN: "c" };
  it("jamais actif sans clés", () => expect(paymentsEnabled({ VERCEL_ENV: "production", PAYDUNYA_MODE: "live" })).toBe(false));
  it("en production, refuse les clés de test", () => {
    expect(paymentsEnabled({ ...keys, VERCEL_ENV: "production", PAYDUNYA_MODE: "test" })).toBe(false);
    expect(paymentsEnabled({ ...keys, VERCEL_ENV: "production" })).toBe(false);
  });
  it("en production, accepte les clés live", () => expect(paymentsEnabled({ ...keys, VERCEL_ENV: "production", PAYDUNYA_MODE: "live" })).toBe(true));
  it("hors production, accepte le mode test", () => expect(paymentsEnabled({ ...keys, PAYDUNYA_MODE: "test" })).toBe(true));
});

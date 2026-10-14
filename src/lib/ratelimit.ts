import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Limiteur de débit (fenêtre fixe) partagé par toutes les instances : le compteur vit dans la base, donc un attaquant
 * ne contourne plus la limite en tombant sur une autre instance. Si la base ne répond pas, on retombe sur un compteur
 * local à l'instance : mieux qu'aucune limite, et le site ne bloque jamais à cause du limiteur.
 */

// ───────────── Repli local (par instance) ─────────────
const hits = new Map<string, number[]>();

export function memoryLimit(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

/** Les clés contiennent des données saisies par le visiteur (adresse e-mail, IP) : on les réduit à une empreinte de taille fixe. */
export const limitKey = (key: string) => {
  const [bucket, ...rest] = key.split(":");
  return `${bucket.slice(0, 30)}:${createHash("sha256").update(rest.join(":")).digest("hex").slice(0, 32)}`;
};

/** true = autorisé, false = limite atteinte. */
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const k = limitKey(key);
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${k}, 1, now() + (${Math.ceil(windowMs / 1000)} * interval '1 second'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" < now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < now() THEN now() + (${Math.ceil(windowMs / 1000)} * interval '1 second') ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    return Number(rows[0]?.count ?? 1) <= max;
  } catch {
    return memoryLimit(key, max, windowMs);
  }
}

/** Supprime les compteurs expirés (appelé par la tâche quotidienne). */
export async function purgeRateLimits(): Promise<number> {
  const r = await db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 3_600_000) } } });
  return r.count;
}

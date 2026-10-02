// Choix de la base de données selon l'environnement (fonction pure, testée).
// - Production Vercel  → DATABASE_URL (la vraie base)
// - Tout le reste (poste local, aperçus Vercel) → DEV_DATABASE_URL (base de test séparée)
// Il n'y a volontairement AUCUN repli vers la base de production hors production.
type Env = Record<string, string | undefined>;

export function databaseUrl(env: Env = process.env, opts: { unpooled?: boolean } = {}): string {
  const production = env.VERCEL_ENV === "production" || env.PRISMA_TARGET === "production";
  const pick = (base: string) => (opts.unpooled ? env[`${base}_UNPOOLED`] || env[base] : env[base]);
  const url = production ? pick("DATABASE_URL") : pick("DEV_DATABASE_URL");
  if (!url) {
    throw new Error(
      production
        ? "DATABASE_URL manquante (base de production)."
        : "DEV_DATABASE_URL manquante : la base de test est requise hors production (vercel env pull). Aucun repli vers la production.",
    );
  }
  return url;
}

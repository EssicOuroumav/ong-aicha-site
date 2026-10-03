import * as Sentry from "@sentry/nextjs";

// Sentry côté serveur : inactif tant que SENTRY_DSN (ou NEXT_PUBLIC_SENTRY_DSN) n'est pas défini, et jamais en local.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.VERCEL_ENV;

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && (env === "production" || env === "preview"),
  environment: env ?? "development",
  tracesSampleRate: 0, // pas de mesure de performance : on ne suit que les erreurs
  beforeSend(event) {
    // Aucune donnée personnelle : ni cookies, ni en-têtes, ni corps de requête, ni utilisateur
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
      delete event.request.data;
      delete event.request.query_string;
    }
    delete event.user;
    return event;
  },
});

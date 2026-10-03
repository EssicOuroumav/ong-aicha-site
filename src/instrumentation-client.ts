// Sentry côté navigateur : chargé après l'affichage de la page (aucun impact sur la vitesse), inactif sans DSN.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && typeof window !== "undefined") {
  window.addEventListener("load", () => {
    import("@sentry/nextjs").then((Sentry) =>
      Sentry.init({
        dsn,
        environment: window.location.hostname.includes("localhost") ? "development" : "production",
        enabled: !window.location.hostname.includes("localhost"),
        tracesSampleRate: 0,
        beforeSend(event) {
          delete event.user;
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
            delete event.request.query_string;
          }
          return event;
        },
      }),
    );
  });
}

export {};

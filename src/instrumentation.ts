import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("../sentry.server.config");
}

// Appelée par Next.js pour chaque erreur serveur : Sentry (si activé) + notre journal d'erreurs sans données personnelles.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  Sentry.captureRequestError(err, request, context);
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const message = err instanceof Error ? err.message : String(err);
  if (/NEXT_(NOT_FOUND|REDIRECT)/.test(message)) return;
  const { logError } = await import("@/lib/errorlog");
  await logError({
    source: "server",
    path: request.path,
    message,
    stack: err instanceof Error ? err.stack : undefined,
    digest: typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : undefined,
  });
};

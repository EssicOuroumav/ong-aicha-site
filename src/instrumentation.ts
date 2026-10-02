import type { Instrumentation } from "next";

// Appelée par Next.js pour chaque erreur serveur (rendu, action, route). Les erreurs sont aussi dans les logs Vercel.
export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
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

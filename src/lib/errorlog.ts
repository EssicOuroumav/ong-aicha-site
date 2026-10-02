import { db } from "@/lib/db";
import { fingerprint, sanitizeMessage, sanitizePath } from "@/lib/errorsanitize";

type Entry = { source: "server" | "client"; path: string; message: string; stack?: string; digest?: string };

/** Enregistre une erreur (regroupée par empreinte). Ne lève jamais : un échec de journalisation ne doit pas aggraver l'erreur. */
export async function logError(e: Entry) {
  try {
    const path = sanitizePath(e.path || "/");
    const message = sanitizeMessage(e.message || "Erreur inconnue");
    const stack = e.stack ? sanitizeMessage(e.stack.split("\n").slice(0, 8).join("\n"), 1500) : null;
    const fp = fingerprint(e.source, path, message);
    await db.errorLog.upsert({
      where: { fingerprint: fp },
      update: { count: { increment: 1 }, lastSeen: new Date(), resolved: false },
      create: { fingerprint: fp, source: e.source, path, message, stack, digest: e.digest ?? null },
    });
    // Purge occasionnelle : on ne garde que 90 jours
    if (Math.random() < 0.02) await db.errorLog.deleteMany({ where: { lastSeen: { lt: new Date(Date.now() - 90 * 864e5) } } });
  } catch (err) {
    console.error("[errorlog] journalisation impossible", err);
  }
}

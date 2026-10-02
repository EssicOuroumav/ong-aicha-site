import { db } from "@/lib/db";
import { fingerprint, sanitizeMessage, sanitizePath } from "@/lib/errorsanitize";
import { escapeHtml, layout, notifyAddress, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";

type Entry = { source: "server" | "client"; path: string; message: string; stack?: string; digest?: string };

/** Enregistre une erreur (regroupée par empreinte). Ne lève jamais : un échec de journalisation ne doit pas aggraver l'erreur. */
export async function logError(e: Entry) {
  try {
    const path = sanitizePath(e.path || "/");
    const message = sanitizeMessage(e.message || "Erreur inconnue");
    const stack = e.stack ? sanitizeMessage(e.stack.split("\n").slice(0, 8).join("\n"), 1500) : null;
    const fp = fingerprint(e.source, path, message);
    const before = await db.errorLog.findUnique({ where: { fingerprint: fp }, select: { resolved: true } });
    await db.errorLog.upsert({
      where: { fingerprint: fp },
      update: { count: { increment: 1 }, lastSeen: new Date(), resolved: false },
      create: { fingerprint: fp, source: e.source, path, message, stack, digest: e.digest ?? null },
    });
    // Alerte e-mail : seulement pour une erreur nouvelle ou rouverte (pas à chaque répétition), 10 e-mails par heure au maximum
    if ((!before || before.resolved) && rateLimit("errormail", 10, 60 * 60 * 1000)) {
      await sendEmail({
        to: notifyAddress(),
        subject: `Erreur sur le site ONG AICHA (${e.source === "server" ? "serveur" : "navigateur"})`,
        html: layout("Une erreur a été enregistrée", `<p><b>${escapeHtml(message)}</b></p><p>Page : ${escapeHtml(path)}</p><p>Consultez le détail dans l'espace administrateur, section « Journal d'erreurs ».</p>`),
      });
    }
    // Purge occasionnelle : on ne garde que 90 jours
    if (Math.random() < 0.02) await db.errorLog.deleteMany({ where: { lastSeen: { lt: new Date(Date.now() - 90 * 864e5) } } });
  } catch (err) {
    console.error("[errorlog] journalisation impossible", err);
  }
}

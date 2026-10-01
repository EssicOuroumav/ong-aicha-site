import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { createInvoice, paydunyaConfigured } from "@/lib/paydunya";
import { escapeHtml, layout, sendEmail } from "@/lib/email";

const monthsOf = { MONTHLY: 1, QUARTERLY: 3, YEARLY: 12 } as const;

export function addPeriod(from: Date, frequency: keyof typeof monthsOf) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + monthsOf[frequency]);
  return d;
}

/** Crée un don en attente + lien de paiement PayDunya et l'envoie par e-mail au parrain. */
export async function sendSponsorshipReminder(sponsorshipId: string, origin: string): Promise<{ ok: boolean; reason?: string }> {
  const s = await db.sponsorship.findUnique({ where: { id: sponsorshipId } });
  if (!s) return { ok: false, reason: "introuvable" };
  if (!s.amount) return { ok: false, reason: "montant par échéance non défini" };

  const amount = s.amount * s.children;
  const reference = `AICHA-P-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  let link = `${origin}/fr/donate`;
  let token: string | undefined;
  if (paydunyaConfigured()) {
    const inv = await createInvoice({
      amount, description: `Parrainage ONG AICHA – ${reference}`, reference,
      returnUrl: `${origin}/fr/donate/result?ref=${reference}`,
      cancelUrl: `${origin}/fr/donate/result?ref=${reference}&cancelled=1`,
      callbackUrl: `${origin}/api/paydunya/ipn`,
    });
    link = inv.url;
    token = inv.token;
  } else if (process.env.NODE_ENV === "production") {
    return { ok: false, reason: "PayDunya non configuré" };
  }
  await db.donation.create({
    data: { reference, donorName: s.fullName, email: s.email, phone: s.phone, country: s.country, amount, cause: "sponsorship", sponsorshipId: s.id, providerToken: token },
  });
  const sent = await sendEmail({
    to: s.email,
    subject: "ONG AICHA – Rappel de votre parrainage",
    html: layout("Votre contribution de parrainage", `<p>Bonjour ${escapeHtml(s.fullName)},</p><p>Merci pour votre engagement auprès de ${s.children} enfant(s). Votre contribution de <b>${amount.toLocaleString("fr-FR")} FCFA</b> est attendue pour cette échéance.</p><p><a href="${link}" style="background:#1b6b3a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Payer en toute sécurité</a></p><p style="color:#5b6b61;font-size:13px">Orange Money, MTN, Moov, Wave ou carte bancaire.</p>`),
  });
  // On n'avance l'échéance que si le parrain a réellement reçu son lien (sinon le cron réessaiera demain)
  if (!sent) return { ok: false, reason: "e-mail non envoyé (clé Resend absente ?)" };
  await db.sponsorship.update({ where: { id: s.id }, data: { lastReminderAt: new Date(), nextDueAt: addPeriod(s.nextDueAt ?? new Date(), s.frequency) } });
  return { ok: true };
}

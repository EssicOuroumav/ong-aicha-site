import { db } from "@/lib/db";
import { confirmInvoice } from "@/lib/paydunya";
import { escapeHtml, layout, sendEmail, notifyAddress } from "@/lib/email";

/** Synchronise un don avec PayDunya et envoie le reçu une seule fois. */
export async function syncDonation(reference: string) {
  const donation = await db.donation.findUnique({ where: { reference } });
  if (!donation) return null;
  if (donation.status !== "PENDING" || !donation.providerToken) return donation;

  const result = await confirmInvoice(donation.providerToken);
  const status = result.status === "completed" ? "COMPLETED" : result.status === "cancelled" ? "CANCELLED" : result.status === "failed" ? "FAILED" : "PENDING";
  if (status === "COMPLETED" && result.amount !== undefined && result.amount !== donation.amount) {
    console.error("[donation] montant incohérent", reference, result.amount, donation.amount);
    return db.donation.update({ where: { reference }, data: { status: "FAILED" } });
  }
  // Transition atomique : seul le premier appel (retour navigateur ou IPN) fait passer le don de PENDING à son statut final
  await db.donation.updateMany({ where: { reference, status: "PENDING" }, data: { status } });
  if (status === "COMPLETED") await sendReceipt(reference);
  return db.donation.findUnique({ where: { reference } });
}

export async function sendReceipt(reference: string) {
  const d = await db.donation.findUnique({ where: { reference } });
  if (!d || d.receiptSent) return;
  const amount = `${d.amount.toLocaleString("fr-FR")} FCFA`;
  const claimed = await db.donation.updateMany({ where: { reference, receiptSent: false }, data: { receiptSent: true } });
  if (claimed.count === 0) return;
  if (d.email) {
    await sendEmail({
      to: d.email,
      subject: `ONG AICHA – Reçu de votre don (${d.reference})`,
      html: layout("Merci pour votre don !", `<p>Bonjour ${escapeHtml(d.donorName)},</p><p>Nous avons bien reçu votre don de <b>${amount}</b>. Qu'Allah vous le rende au centuple.</p><p>Référence : <b>${d.reference}</b></p>`),
    });
  }
  await sendEmail({ to: notifyAddress(), subject: `Nouveau don : ${amount}`, html: layout("Nouveau don reçu", `<p>${escapeHtml(d.donorName)} – ${amount} – ${d.reference}</p>`) });
}

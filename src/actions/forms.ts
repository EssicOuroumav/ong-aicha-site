"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, siteUrl } from "@/lib/request";
import { escapeHtml, layout, notifyAddress, sendEmail } from "@/lib/email";
import { createInvoice, paymentsEnabled } from "@/lib/paydunya";

export type FormState = { ok: boolean; error?: "validation" | "rate" | "server"; fields?: string[] };

const str = (max: number) => z.string().trim().max(max);
const phone = z.string().trim().min(6).max(30).regex(/^[0-9+()\s.-]+$/);

function bad(error: z.ZodError): FormState {
  return { ok: false, error: "validation", fields: error.issues.map((i) => String(i.path[0])) };
}

async function guard(form: FormData, bucket: string, max = 10): Promise<FormState | null> {
  // Champ piège : un humain ne remplit jamais "website"
  if (String(form.get("website") ?? "").length > 0) return { ok: true };
  const ip = await clientIp();
  if (!rateLimit(`${bucket}:${ip}`, max, 10 * 60 * 1000)) return { ok: false, error: "rate" };
  return null;
}

// ───────────── Contact ─────────────
const contactSchema = z.object({
  consent: z.literal("on"),
  name: str(120).min(2),
  email: z.string().trim().email().max(160),
  subject: str(160).optional(),
  message: str(5000).min(5),
});

export async function submitContact(_: FormState | null, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "contact");
  if (blocked) return blocked;
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad(parsed.error);
  try {
    const d = parsed.data;
    await db.contactMessage.create({ data: { name: d.name, email: d.email, subject: d.subject || null, message: d.message } });
    await sendEmail({
      to: notifyAddress(),
      replyTo: d.email,
      subject: `Nouveau message : ${d.subject || d.name}`,
      html: layout("Nouveau message de contact", `<p><b>${escapeHtml(d.name)}</b> (${escapeHtml(d.email)})</p><p>${escapeHtml(d.message).replace(/\n/g, "<br>")}</p>`),
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "server" };
  }
}

// ───────────── Adhésion ─────────────
const joinSchema = z.object({
  consent: z.literal("on"),
  firstName: str(80).min(2),
  lastName: str(80).min(2),
  phone,
  email: z.union([z.literal(""), z.string().trim().email().max(160)]).optional(),
  city: str(100).optional(),
  type: z.enum(["MEMBER", "VOLUNTEER"]),
  message: str(2000).optional(),
});

export async function submitJoin(_: FormState | null, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "join");
  if (blocked) return blocked;
  const parsed = joinSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad(parsed.error);
  try {
    const d = parsed.data;
    await db.membership.create({
      data: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email || null, city: d.city || null, type: d.type, message: d.message || null },
    });
    await sendEmail({
      to: notifyAddress(),
      subject: `Nouvelle adhésion (${d.type === "MEMBER" ? "membre" : "bénévole"}) : ${d.firstName} ${d.lastName}`,
      html: layout("Nouvelle demande d'adhésion", `<p>${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} – ${escapeHtml(d.phone)}</p>`),
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "server" };
  }
}

// ───────────── Parrainage ─────────────
const sponsorSchema = z.object({
  fullName: str(120).min(2),
  email: z.string().trim().email().max(160),
  phone,
  country: str(120).optional(),
  children: z.coerce.number().int().min(1).max(50),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  note: str(2000).optional(),
  confirm: z.literal("on"),
  consent: z.literal("on"),
});

export async function submitSponsorship(_: FormState | null, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "sponsor");
  if (blocked) return blocked;
  const parsed = sponsorSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad(parsed.error);
  try {
    const { confirm: _c, consent: _k, ...d } = parsed.data;
    await db.sponsorship.create({ data: { ...d, country: d.country || null, note: d.note || null } });
    await sendEmail({
      to: notifyAddress(),
      subject: `Nouvelle demande de parrainage : ${d.fullName}`,
      html: layout("Demande de parrainage", `<p>${escapeHtml(d.fullName)} – ${escapeHtml(d.phone)} – ${d.children} enfant(s), ${d.frequency}</p>`),
    });
    await sendEmail({
      to: d.email,
      subject: "ONG AICHA – Nous avons bien reçu votre demande de parrainage",
      html: layout("Merci pour votre engagement", `<p>Bonjour ${escapeHtml(d.fullName)},</p><p>Votre demande de parrainage a bien été reçue. Notre équipe vous contactera très prochainement pour la finaliser.</p><p>Qu'Allah vous récompense.</p>`),
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "server" };
  }
}

// ───────────── Don en ligne ─────────────
const donationSchema = z.object({
  consent: z.literal("on"),
  amount: z.coerce.number().int().min(500).max(50_000_000),
  donorName: str(120).min(2),
  email: z.string().trim().email().max(160),
  phone: phone.optional().or(z.literal("")),
  country: str(120).optional(),
  cause: z.enum(["general", "clinics", "widows", "orphans", "school", "emergency", "red", "pink", "zakat"]).default("general"),
  message: str(1000).optional(),
  anonymous: z.string().optional(),
  lang: z.enum(["fr", "en", "ar"]).default("fr"),
});

export async function submitDonation(_: FormState | null, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "donate", 15);
  if (blocked) return blocked;
  const parsed = donationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad(parsed.error);
  const d = parsed.data;

  const reference = `AICHA-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const origin = await siteUrl();
  // Sans paiement en ligne actif en production : intention de don + instructions Mobile Money (confirmée à la main par l'ONG)
  const manual = !paymentsEnabled() && process.env.NODE_ENV === "production";
  let target: string;
  try {
    await db.donation.create({
      data: {
        reference, donorName: d.donorName, email: d.email, phone: d.phone || null, country: d.country || null,
        amount: d.amount, cause: d.cause, message: d.message || null, anonymous: d.anonymous === "on",
        provider: manual ? "manual" : "paydunya",
      },
    });
    const returnUrl = `${origin}/${d.lang}/donate/result?ref=${reference}`;

    if (manual) {
      await sendEmail({
        to: notifyAddress(),
        subject: `Intention de don (Mobile Money) : ${d.amount.toLocaleString("fr-FR")} FCFA`,
        html: layout("Nouvelle intention de don", `<p><b>${escapeHtml(d.donorName)}</b> – ${escapeHtml(d.email)}${d.phone ? " – " + escapeHtml(d.phone) : ""}</p><p>Montant annoncé : <b>${d.amount.toLocaleString("fr-FR")} FCFA</b> – cause : ${escapeHtml(d.cause)}</p><p>Référence : <b>${reference}</b></p><p>À confirmer dans l'admin (section Dons) dès réception du Mobile Money.</p>`),
      });
      target = returnUrl;
    } else if (paymentsEnabled()) {
      const invoice = await createInvoice({
        amount: d.amount,
        description: `Don ONG AICHA – ${reference}`,
        reference,
        returnUrl,
        cancelUrl: `${origin}/${d.lang}/donate/result?ref=${reference}&cancelled=1`,
        callbackUrl: `${origin}/api/paydunya/ipn`,
      });
      await db.donation.update({ where: { reference }, data: { providerToken: invoice.token } });
      target = invoice.url;
    } else {
      // Développement sans clés : simulateur local
      target = `${origin}/api/dev-pay?ref=${reference}&lang=${d.lang}`;
    }
  } catch (e) {
    console.error(e);
    await db.donation.updateMany({ where: { reference }, data: { status: "FAILED" } }).catch(() => {});
    return { ok: false, error: "server" };
  }
  redirect(target);
}

// ───────────── Demande d'aide ─────────────
const helpSchema = z.object({
  kind: z.enum(["SOS", "WIDOW", "OTHER"]),
  name: str(120).min(2),
  phone,
  email: z.union([z.literal(""), z.string().trim().email().max(160)]).optional(),
  nature: str(300).min(3),
  message: str(3000).optional(),
  consent: z.literal("on"),
});

export async function submitHelp(_: FormState | null, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "help", 8);
  if (blocked) return blocked;
  const parsed = helpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return bad(parsed.error);
  try {
    const { consent: _c, ...d } = parsed.data;
    await db.helpRequest.create({ data: { ...d, email: d.email || null, message: d.message || null } });
    await sendEmail({
      to: notifyAddress(),
      subject: `Demande d'aide (${d.kind}) : ${d.name}`,
      html: layout("Nouvelle demande d'aide", `<p><b>${escapeHtml(d.name)}</b> – ${escapeHtml(d.phone)}</p><p>${escapeHtml(d.nature)}</p>`),
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "server" };
  }
}

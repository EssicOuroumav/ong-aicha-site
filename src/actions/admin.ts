"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { signOut } from "@/auth";
import { requireArea, requireUser } from "@/lib/guard";
import { siteUrl } from "@/lib/request";
import { addPeriod, sendSponsorshipReminder } from "@/lib/sponsorship";
import { flatten, LIST_KEYS, LIST_PATHS } from "@/lib/overrides";
import { getBaseDictionaries } from "@/i18n/dictionaries";

const L = z.object({ fr: z.string().default(""), en: z.string().default(""), ar: z.string().default("") });
const loc = (form: FormData, name: string) => ({
  fr: String(form.get(`${name}_fr`) ?? "").trim(),
  en: String(form.get(`${name}_en`) ?? "").trim(),
  ar: String(form.get(`${name}_ar`) ?? "").trim(),
});
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function refresh() {
  revalidatePath("/", "layout");
}

// ───────── Mot de passe ─────────
export async function changePassword(_: unknown, form: FormData): Promise<{ error?: string; done?: boolean }> {
  const session = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 10 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) return { error: "Le nouveau mot de passe doit faire au moins 10 caractères, avec lettres et chiffres." };
  if (next !== String(form.get("confirm") ?? "")) return { error: "La confirmation ne correspond pas." };
  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: "Mot de passe actuel incorrect." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12), mustChangePw: false } });
  // Le jeton de session mémorise mustChangePw : on force une reconnexion
  await signOut({ redirectTo: "/admin/login" });
  return { done: true };
}

// ───────── Blog ─────────
export async function savePost(form: FormData) {
  const user = await requireArea("content");
  const id = String(form.get("id") ?? "");
  const title = loc(form, "title");
  if (!title.fr) throw new Error("Titre français requis");
  const data = {
    title,
    excerpt: loc(form, "excerpt"),
    content: loc(form, "content"),
    coverImage: String(form.get("coverImage") ?? "").trim() || null,
    published: form.get("published") === "on",
    publishedAt: form.get("published") === "on" ? new Date(String(form.get("publishedAt") || Date.now())) : null,
  };
  if (id) {
    await db.post.update({ where: { id }, data });
  } else {
    let slug = slugify(title.fr) || `article-${Date.now()}`;
    if (await db.post.findUnique({ where: { slug } })) slug += `-${Date.now().toString(36)}`;
    await db.post.create({ data: { ...data, slug, authorId: user.id } });
  }
  refresh();
  redirect("/admin/posts");
}

export async function deletePost(form: FormData) {
  await requireArea("content");
  await db.post.delete({ where: { id: String(form.get("id")) } });
  refresh();
  redirect("/admin/posts");
}

// ───────── Actions (activités) ─────────
export async function saveActivity(form: FormData) {
  await requireArea("content");
  const id = String(form.get("id") ?? "");
  const title = loc(form, "title");
  if (!title.fr) throw new Error("Titre français requis");
  const impact = [1, 2, 3, 4]
    .map((i) => ({ value: String(form.get(`impact_value_${i}`) ?? "").trim().slice(0, 20), label: loc(form, `impact_label_${i}`) }))
    .filter((x) => x.value && x.label.fr);
  const data = {
    title, summary: loc(form, "summary"), description: loc(form, "description"), period: loc(form, "period"),
    impact,
    featured: form.get("featured") === "on",
    category: ["health", "education", "social"].includes(String(form.get("category"))) ? String(form.get("category")) : null,
    coverImage: String(form.get("coverImage") ?? "").trim() || null,
    location: String(form.get("location") ?? "").trim() || null,
    order: Number(form.get("order") ?? 0) || 0,
    published: form.get("published") === "on",
  };
  if (id) await db.activity.update({ where: { id }, data });
  else {
    let slug = slugify(title.fr) || `action-${Date.now()}`;
    if (await db.activity.findUnique({ where: { slug } })) slug += `-${Date.now().toString(36)}`;
    await db.activity.create({ data: { ...data, slug } });
  }
  refresh();
  redirect("/admin/activities");
}

export async function deleteActivity(form: FormData) {
  await requireArea("content");
  await db.activity.delete({ where: { id: String(form.get("id")) } });
  refresh();
  redirect("/admin/activities");
}

// ───────── Galerie ─────────
export async function addMedia(form: FormData) {
  await requireArea("content");
  const url = String(form.get("url") ?? "").trim();
  if (!url) return;
  if (!/^(https:\/\/|\/images\/)/.test(url)) throw new Error("URL invalide");
  await db.mediaItem.create({
    data: { url, kind: String(form.get("kind")) === "VIDEO" ? "VIDEO" : "PHOTO", album: String(form.get("album") ?? "") || null, caption: loc(form, "caption") },
  });
  refresh();
  revalidatePath("/admin/media");
}

export async function deleteMedia(form: FormData) {
  await requireArea("content");
  await db.mediaItem.delete({ where: { id: String(form.get("id")) } });
  refresh();
  revalidatePath("/admin/media");
}

// ───────── Dons / demandes ─────────
export async function addManualDonation(form: FormData) {
  await requireArea("donations");
  const parsed = z.object({
    donorName: z.string().trim().min(2).max(120),
    amount: z.coerce.number().int().min(100).max(100_000_000),
    method: z.enum(["Mobile Money", "Espèces", "Virement", "Chèque", "Autre"]),
    cause: z.enum(["general", "clinics", "widows", "orphans", "school", "emergency", "red", "pink", "zakat"]).default("general"),
    email: z.union([z.literal(""), z.string().email()]).optional(),
    note: z.string().max(500).optional(),
  }).parse(Object.fromEntries(form));
  const reference = `AICHA-M-${Date.now().toString(36).toUpperCase()}`;
  await db.donation.create({
    data: {
      reference, donorName: parsed.donorName, amount: parsed.amount, cause: parsed.cause, email: parsed.email || null,
      message: `${parsed.method}${parsed.note ? " – " + parsed.note : ""}`, provider: "manual", status: "COMPLETED", receiptSent: true,
    },
  });
  revalidatePath("/admin/donations");
  revalidatePath("/admin");
}

export async function setDonationStatus(form: FormData) {
  await requireArea("donations");
  const status = z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]).parse(form.get("status"));
  await db.donation.update({ where: { id: String(form.get("id")) }, data: { status } });
  revalidatePath("/admin/donations");
}

const requestStatus = z.enum(["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"]);

export async function setSponsorship(form: FormData) {
  await requireArea("requests");
  const id = String(form.get("id"));
  const status = requestStatus.parse(form.get("status"));
  const amount = Number(form.get("amount") || 0) || null;
  const current = await db.sponsorship.findUniqueOrThrow({ where: { id } });
  await db.sponsorship.update({
    where: { id },
    data: { status, amount, nextDueAt: status === "APPROVED" ? current.nextDueAt ?? addPeriod(new Date(), current.frequency) : current.nextDueAt },
  });
  revalidatePath("/admin/sponsorships");
}

export async function remindSponsor(form: FormData) {
  await requireArea("requests");
  const res = await sendSponsorshipReminder(String(form.get("id")), await siteUrl());
  revalidatePath("/admin/sponsorships");
  redirect(`/admin/sponsorships?reminder=${res.ok ? "ok" : encodeURIComponent(res.reason ?? "erreur")}`);
}

export async function setMembership(form: FormData) {
  await requireArea("requests");
  await db.membership.update({ where: { id: String(form.get("id")) }, data: { status: requestStatus.parse(form.get("status")) } });
  revalidatePath("/admin/memberships");
}

export async function setHelpRequest(form: FormData) {
  await requireArea("requests");
  await db.helpRequest.update({ where: { id: String(form.get("id")) }, data: { status: requestStatus.parse(form.get("status")) } });
  revalidatePath("/admin/help");
}

export async function toggleMessageRead(form: FormData) {
  await requireArea("requests");
  const id = String(form.get("id"));
  const m = await db.contactMessage.findUniqueOrThrow({ where: { id } });
  await db.contactMessage.update({ where: { id }, data: { read: !m.read } });
  revalidatePath("/admin/messages");
}

// ───────── Réglages ─────────
export async function saveSettings(form: FormData) {
  await requireArea("settings");
  for (const key of ["phone", "donationPhone", "email", "address", "facebook", "youtube", "instagram"]) {
    const value = String(form.get(key) ?? "").trim();
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  refresh();
  revalidatePath("/admin/settings");
}

// ───────── Utilisateurs ─────────
const roleSchema = z.enum(["SUPER_ADMIN", "EDITOR", "DONATIONS_MANAGER"]);

export async function createUser(_: unknown, form: FormData): Promise<{ error?: string; password?: string }> {
  await requireArea("users");
  const parsed = z.object({ email: z.string().email(), name: z.string().min(2).max(100), role: roleSchema }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Données invalides." };
  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return { error: "Cet e-mail existe déjà." };
  const { randomBytes } = await import("node:crypto");
  const password = randomBytes(9).toString("base64url");
  await db.user.create({ data: { email, name: parsed.data.name, role: parsed.data.role, mustChangePw: true, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/admin/users");
  return { password };
}

export async function updateUser(form: FormData) {
  const me = await requireArea("users");
  const id = String(form.get("id"));
  const role = roleSchema.parse(form.get("role"));
  const active = form.get("active") === "on";
  if (id === me.id && (role !== "SUPER_ADMIN" || !active)) return; // on ne se retire pas ses propres droits
  await db.user.update({ where: { id }, data: { role, active } });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(_: unknown, form: FormData): Promise<{ error?: string; password?: string }> {
  await requireArea("users");
  const { randomBytes } = await import("node:crypto");
  const password = randomBytes(9).toString("base64url");
  await db.user.update({ where: { id: String(form.get("id")) }, data: { passwordHash: await bcrypt.hash(password, 12), mustChangePw: true } });
  return { password };
}

// ───────── Textes fixes et listes modifiables ─────────
const LANGS = ["fr", "en", "ar"] as const;

/** Clés de texte éditables d'une section (hors listes structurées, qui ont leur propre éditeur) */
export async function editableKeys(section: string) {
  const base = await getBaseDictionaries();
  const listPaths = Object.values(LIST_PATHS);
  return Object.keys(flatten(base.fr))
    .filter((k) => k.split(/[.[]/)[0] === section)
    .filter((k) => !listPaths.some((lp) => k === lp || k.startsWith(lp + "[")))
    .filter((k) => k !== "meta.siteName");
}

export async function saveTexts(form: FormData) {
  await requireArea("content");
  const section = String(form.get("section") ?? "");
  const base = await getBaseDictionaries();
  const flat = { fr: flatten(base.fr), en: flatten(base.en), ar: flatten(base.ar) };
  const keys = await editableKeys(section);
  if (!keys.length) return;
  for (const key of keys) {
    for (const lang of LANGS) {
      const raw = form.get(`${key}||${lang}`);
      if (raw === null) continue;
      const value = String(raw).trim().slice(0, 4000);
      const original = flat[lang][key] ?? "";
      if (!value || value === original) await db.textOverride.deleteMany({ where: { key, lang } });
      else await db.textOverride.upsert({ where: { key_lang: { key, lang } }, update: { value }, create: { key, lang, value } });
    }
  }
  refresh();
  revalidatePath("/admin/texts");
}

export async function resetTexts(form: FormData) {
  await requireArea("content");
  const keys = await editableKeys(String(form.get("section") ?? ""));
  if (keys.length) await db.textOverride.deleteMany({ where: { key: { in: keys } } });
  refresh();
  revalidatePath("/admin/texts");
}

const loc3 = z.object({ fr: z.string().max(2000).default(""), en: z.string().max(2000).default(""), ar: z.string().max(2000).default("") });
const listSchemas = {
  partners: z.array(z.object({ name: loc3, logo: z.string().max(500).refine((v) => v === "" || /^(https:\/\/|\/partners\/|\/images\/)/.test(v), "URL invalide").default("") })).max(40),
  faq: z.array(z.object({ q: loc3, a: loc3 })).max(40),
  timeline: z.array(z.object({ year: z.string().max(12), title: loc3, text: loc3 })).max(40),
  stats: z.array(z.object({ value: z.string().max(20), label: loc3 })).max(8),
};

export async function saveList(form: FormData) {
  await requireArea("content");
  const key = z.enum(LIST_KEYS).parse(form.get("key"));
  const data = listSchemas[key].parse(JSON.parse(String(form.get("data") ?? "[]")));
  const clean = (data as { [k: string]: unknown }[]).filter((item) => {
    const first = Object.values(item)[0];
    return typeof first === "string" ? first.trim() : Object.values(first as Record<string, string>).some((v) => v.trim());
  });
  const json = JSON.parse(JSON.stringify(clean));
  await db.contentList.upsert({ where: { key }, update: { data: json }, create: { key, data: json } });
  refresh();
  revalidatePath("/admin/lists");
}

export async function resetList(form: FormData) {
  await requireArea("content");
  const key = z.enum(LIST_KEYS).parse(form.get("key"));
  await db.contentList.deleteMany({ where: { key } });
  refresh();
  revalidatePath("/admin/lists");
}

// ───────── Journal d'erreurs ─────────
export async function setErrorResolved(form: FormData) {
  await requireArea("settings");
  await db.errorLog.update({ where: { id: String(form.get("id")) }, data: { resolved: form.get("resolved") === "1" } });
  revalidatePath("/admin/errors");
}

export async function deleteResolvedErrors() {
  await requireArea("settings");
  await db.errorLog.deleteMany({ where: { resolved: true } });
  revalidatePath("/admin/errors");
}

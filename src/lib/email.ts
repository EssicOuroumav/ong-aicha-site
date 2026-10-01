import { Resend } from "resend";

const from = process.env.EMAIL_FROM ?? "ONG AICHA <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY absent : e-mail non envoyé (« ${opts.subject} »)`);
    return false;
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.error("[email] échec d'envoi", e);
    return false;
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function layout(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17251c">
  <div style="background:#14532d;color:#fff;padding:20px;border-radius:12px 12px 0 0"><strong style="font-size:20px">ONG AICHA</strong><br><span style="color:#c9a24b">Soutenir pour soulager</span></div>
  <div style="border:1px solid #e4e0d4;border-top:0;padding:24px;border-radius:0 0 12px 12px"><h2 style="margin-top:0;color:#14532d">${title}</h2>${body}</div></div>`;
}

export const notifyAddress = () => process.env.NOTIFY_EMAIL ?? "ongaicha2022@gmail.com";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { db } from "@/lib/db";
import { syncDonation } from "@/lib/donations";
import { getSettings } from "@/lib/settings";
import { PageHero, Section } from "@/components/ui";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function DonationResult({ params, searchParams }: PageProps<"/[lang]/donate/result">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { ref, cancelled } = await searchParams;
  const reference = typeof ref === "string" ? ref : "";
  const t = await getDictionary(lang);
  let donation = reference ? await db.donation.findUnique({ where: { reference } }) : null;
  if (!donation) notFound();
  const manual = donation.provider === "manual";
  if (donation.status === "PENDING" && !manual) donation = (await syncDonation(reference).catch(() => donation)) ?? donation;
  const settings = manual ? await getSettings() : null;

  // Annulation demandée par le donateur : on lui propose de réessayer, sans modifier la base (un paiement tardif reste validé par PayDunya)
  const userCancelled = cancelled === "1" && donation.status === "PENDING" && !manual;
  const view = userCancelled ? { icon: <XCircle size={56} className="text-red-700" />, title: t.donate.failedTitle, text: t.donate.failedText } : {
    COMPLETED: { icon: <CheckCircle2 size={56} className="text-green-700" />, title: t.donate.successTitle, text: t.donate.successText },
    PENDING: { icon: <Clock size={56} className="text-gold-dark" />, title: t.donate.pendingTitle, text: t.donate.pendingText },
    FAILED: { icon: <XCircle size={56} className="text-red-700" />, title: t.donate.failedTitle, text: t.donate.failedText },
    CANCELLED: { icon: <XCircle size={56} className="text-red-700" />, title: t.donate.failedTitle, text: t.donate.failedText },
  }[donation.status];

  if (manual && donation.status === "PENDING" && settings) {
    return (
      <>
        <PageHero title={t.donate.title} />
        <Section>
          <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center sm:p-10">
            <div className="flex justify-center"><Clock size={56} className="text-green-700" /></div>
            <h2 className="mt-4 text-3xl text-green-950">{t.donate.manualTitle}</h2>
            <p className="mt-3 text-muted">{t.donate.manualText.replace("{amount}", donation.amount.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : lang === "en" ? "en-GB" : "fr-FR"))}</p>
            <dl className="mt-8 space-y-5 rounded-2xl bg-green-50 p-6 text-start">
              <div><dt className="text-sm text-muted">{t.donate.manualPhone}</dt><dd className="font-display text-3xl font-extrabold text-green-800" dir="ltr">{settings.donationPhone}</dd></div>
              <div><dt className="text-sm text-muted">{t.donate.manualRefLabel}</dt><dd className="font-mono text-lg font-bold select-all" dir="ltr">{donation.reference}</dd></div>
            </dl>
            <div className="mt-8 flex justify-center"><Link href={`/${lang}`} className="btn btn-outline btn-caps text-green-800">{t.nav.home}</Link></div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero title={t.donate.title} />
      <Section>
        <div className="mx-auto max-w-xl glass rounded-3xl p-10 text-center">
          <div className="flex justify-center">{view.icon}</div>
          <h2 className="mt-4 text-2xl font-bold text-green-800">{view.title}</h2>
          <p className="mt-3 text-muted">{view.text}{donation.status === "COMPLETED" && donation.email && process.env.RESEND_API_KEY ? ` ${t.donate.receiptNote}` : ""}</p>
          <p className="mt-6 text-sm text-muted">{t.donate.reference} : <b dir="ltr">{donation.reference}</b></p>
          <div className="mt-8 flex justify-center gap-3">
            {donation.status === "PENDING" && !userCancelled && <AutoRefresh />}
            {(userCancelled || donation.status === "FAILED" || donation.status === "CANCELLED") && <Link href={`/${lang}/donate`} className="btn btn-gold">{t.donate.retry}</Link>}
            <Link href={`/${lang}`} className="btn btn-outline text-green-700">{t.nav.home}</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

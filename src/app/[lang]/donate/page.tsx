import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/settings";
import { PageHero, Section } from "@/components/ui";
import Link from "next/link";
import { DonateForm } from "@/components/Forms";
import { paydunyaConfigured } from "@/lib/paydunya";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/donate">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).donate.title };
}

export default async function DonatePage({ params }: PageProps<"/[lang]/donate">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, s] = await Promise.all([getDictionary(lang), getSettings()]);
  const online = paydunyaConfigured() || process.env.NODE_ENV !== "production";
  return (
    <>
      <PageHero title={t.donate.title} lead={t.donate.lead} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
            {online ? <DonateForm t={t} lang={lang} /> : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-800">{t.donate.offlineTitle}</h2>
                <p className="mt-4 text-muted">{t.donate.offlineText}</p>
                <p className="my-6 font-display text-4xl font-bold text-green-700" dir="ltr">{s.donationPhone}</p>
                <Link href={`/${lang}/contact`} className="btn btn-gold">{t.donate.offlineCta}</Link>
              </div>
            )}
          </div>
          <aside className="lg:col-span-2 rounded-3xl bg-green-50 p-6 sm:p-8 h-fit">
            <h2 className="text-2xl font-bold text-green-800">{t.donate.otherWaysTitle}</h2>
            <p className="mt-4 text-muted">{t.donate.otherWays}</p>
            <p className="mt-4 font-semibold" dir="ltr">{s.donationPhone}</p>
          </aside>
        </div>
      </Section>
    </>
  );
}

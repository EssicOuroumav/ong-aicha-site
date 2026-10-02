import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/settings";
import { PageHero, Section, SectionTitle } from "@/components/ui";
import { DonateForm } from "@/components/Forms";
import { paymentsEnabled } from "@/lib/paydunya";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/donate">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).donate.title };
}

export default async function DonatePage({ params, searchParams }: PageProps<"/[lang]/donate">) {
  const { lang } = await params;
  const { cause } = await searchParams;
  if (!isLocale(lang)) notFound();
  const [t, s] = await Promise.all([getDictionary(lang), getSettings()]);
  const online = paymentsEnabled() || (process.env.NODE_ENV !== "production");
  return (
    <>
      <PageHero title={t.donate.title} lead={t.donate.lead} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 glass rounded-3xl p-6 sm:p-10">
            <DonateForm t={t} lang={lang} manual={!online} initialCause={typeof cause === "string" && cause in t.donate.causes ? cause : "general"} />
          </div>
          <aside className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8 h-fit">
            <h2 className="text-2xl font-bold text-green-800">{t.donate.otherWaysTitle}</h2>
            <p className="mt-4 text-muted">{t.donate.otherWays}</p>
            <p className="mt-4 font-semibold" dir="ltr">{s.donationPhone}</p>
          </aside>
        </div>
      </Section>
      <Section>
        <SectionTitle eyebrow={t.home.eyebrows.faq} title={t.donate.faqTitle} />
        <div className="mx-auto max-w-3xl space-y-3">
          {t.donate.faq.map((f) => (
            <details key={f.q} className="glass group rounded-2xl p-5">
              <summary className="cursor-pointer list-none font-semibold text-green-900 marker:hidden">{f.q}</summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}

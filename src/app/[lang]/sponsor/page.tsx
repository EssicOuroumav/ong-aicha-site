import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui";
import { SponsorForm } from "@/components/Forms";

export async function generateMetadata({ params }: PageProps<"/[lang]/sponsor">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).sponsor.title, alternates: alternatesFor(lang, "/sponsor") };
}

export default async function SponsorPage({ params }: PageProps<"/[lang]/sponsor">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  return (
    <>
      <PageHero title={t.sponsor.title} lead={t.sponsor.lead} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 glass rounded-3xl p-6 sm:p-10"><SponsorForm t={t} /></div>
          <aside className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-green-800">{t.sponsor.howTitle}</h2>
            <ol className="mt-6 space-y-5">
              {t.sponsor.how.map((s, i) => (
                <li key={s} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-green-900">{i + 1}</span><span className="pt-1">{s}</span></li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>
    </>
  );
}

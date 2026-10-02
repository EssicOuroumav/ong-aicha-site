import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHero, Section } from "@/components/ui";
import { HelpForm } from "@/components/Forms";

export async function generateMetadata({ params }: PageProps<"/[lang]/help">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).help.title };
}

export default async function HelpPage({ params }: PageProps<"/[lang]/help">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  return (
    <>
      <PageHero title={t.help.title} lead={t.help.lead} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="glass rounded-3xl p-6 sm:p-10"><HelpForm t={t} /></div>
          <p className="mt-6 rounded-2xl bg-green-50/70 p-4 text-sm text-muted">{t.help.notice}</p>
        </div>
      </Section>
    </>
  );
}

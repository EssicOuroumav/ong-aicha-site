import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities } from "@/lib/content";
import { PageHero, Section } from "@/components/ui";
import { ActivityCard } from "@/components/Cards";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/activities">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).activities.title };
}

export default async function ActivitiesPage({ params }: PageProps<"/[lang]/activities">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const items = await getActivities();
  return (
    <>
      <PageHero title={t.activities.title} lead={t.activities.lead} />
      <Section>
        {items.length === 0 ? <p className="text-center text-muted">{t.common.noResults}</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => <ActivityCard key={a.id} a={a} lang={lang} label={t.common.readMore} />)}
          </div>
        )}
      </Section>
    </>
  );
}

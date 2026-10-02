import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities } from "@/lib/content";
import { PageHero, Section } from "@/components/ui";
import { ActivityFilter } from "@/components/ActivityFilter";

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
      <Section wide>
        {items.length === 0 ? <p className="text-center text-muted">{t.common.noResults}</p> : (
          <ActivityFilter lang={lang} filters={t.activities.filters} readMore={t.common.readMore}
            items={items.map((a) => ({ id: a.id, slug: a.slug, coverImage: a.coverImage, title: a.title, summary: a.summary, category: a.category }))} />
        )}
      </Section>
    </>
  );
}

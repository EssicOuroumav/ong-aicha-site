import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities, getActivity } from "@/lib/content";
import { PageHero, RichText, Section } from "@/components/ui";
import { ActivityCard } from "@/components/Cards";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/activities/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getActivity(slug);
  if (!a) return {};
  return { title: pick(a.title, lang), description: pick(a.summary, lang), openGraph: a.coverImage ? { images: [a.coverImage] } : undefined };
}

export default async function ActivityPage({ params }: PageProps<"/[lang]/activities/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [t, a, all] = await Promise.all([getDictionary(lang), getActivity(slug), getActivities()]);
  if (!a) notFound();
  const others = all.filter((x) => x.id !== a.id).slice(0, 3);
  const period = pick(a.period, lang);
  return (
    <>
      <PageHero title={pick(a.title, lang)} lead={pick(a.summary, lang)} />
      <Section>
        <div className="mx-auto max-w-3xl">
          {a.coverImage && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
              <Image src={a.coverImage} alt={pick(a.title, lang)} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            </div>
          )}
          {(period || a.location) && (
            <dl className="mb-8 flex flex-wrap gap-x-10 gap-y-2 rounded-2xl bg-green-50 p-5 text-sm">
              {period && <div><dt className="font-semibold text-green-800">{t.activities.period}</dt><dd>{period}</dd></div>}
              {a.location && <div><dt className="font-semibold text-green-800">{t.activities.location}</dt><dd>{a.location}</dd></div>}
            </dl>
          )}
          <RichText text={pick(a.description, lang)} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/${lang}/donate`} className="btn btn-gold">{t.nav.donate}</Link>
            <Link href={`/${lang}/join`} className="btn btn-primary">{t.nav.join}</Link>
          </div>
        </div>
      </Section>
      {others.length > 0 && (
        <section className="bg-green-50">
          <Section>
            <h2 className="mb-8 text-2xl font-bold text-green-800">{t.activities.otherActions}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => <ActivityCard key={o.id} a={o} lang={lang} label={t.common.readMore} />)}
            </div>
          </Section>
        </section>
      )}
    </>
  );
}

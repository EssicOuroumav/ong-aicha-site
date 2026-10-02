import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities, getActivity, getMedia } from "@/lib/content";
import { PageHero, RichText, Section } from "@/components/ui";
import { ActivityCard } from "@/components/Cards";

export const revalidate = 60;

const albumOf: Record<string, string> = { "vague-rose-et-rouge": "vague-rose", "cliniques-mobiles": "cliniques", "paniers-du-ramadan": "ramadan" };
const causeOf: Record<string, string> = {
  "cliniques-mobiles": "clinics", "enveloppe-pour-maman": "widows", "ma-famille-solidaire": "orphans",
  "en-route-pour-l-ecole": "school", "fonds-aide-sociale-urgente": "emergency", "classe-rose": "pink",
};

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
  const [t, a, all, media] = await Promise.all([getDictionary(lang), getActivity(slug), getActivities(), getMedia()]);
  if (!a) notFound();
  const others = all.filter((x) => x.id !== a.id).slice(0, 3);
  const period = pick(a.period, lang);
  const impact = (Array.isArray(a.impact) ? a.impact : []) as { value: string; label: unknown }[];
  const album = albumOf[a.slug];
  const photos = album ? media.filter((m) => m.kind === "PHOTO" && m.album === album).slice(0, 6) : [];
  const cause = causeOf[a.slug] ?? "general";
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
          {impact.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-2xl font-bold text-green-800">{t.activities.impactTitle}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {impact.map((i) => (
                  <div key={i.value + pick(i.label, lang)} className="glass-green rounded-2xl p-5 text-white">
                    <dd className="font-display text-4xl font-bold text-gold">{i.value}</dd>
                    <dt className="mt-1 text-green-50/95">{pick(i.label, lang)}</dt>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {a.slug === "vague-rose-et-rouge" && (
            <div className="glass mt-10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-green-800">{t.activities.bloodTitle}</h2>
              <ul className="mt-3 list-disc space-y-1 ps-6">{t.activities.blood.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          )}
          {photos.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-2xl font-bold text-green-800">{t.activities.galleryTitle}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((m) => (
                  <div key={m.id} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={m.url} alt={pick(m.caption, lang)} fill sizes="(min-width:640px) 240px, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/${lang}/donate?cause=${cause}`} className="btn btn-gold">{t.common.supportThis}</Link>
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

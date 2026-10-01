import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeartHandshake, HandHeart, Stethoscope, UsersRound } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities, getPosts } from "@/lib/content";
import { Section, SectionTitle } from "@/components/ui";
import { ActivityCard, PostCard } from "@/components/Cards";
import { HeroSlider } from "@/components/HeroSlider";

export const revalidate = 60;

const heroImages = [
  "/images/vague-rose-port-bouet-2025-05.jpg",
  "/images/ramadan-paniers-2025-01.jpg",
  "/images/tabaski-habits-neufs-2025-01.jpg",
  "/images/vague-rose-port-bouet-2025-06.jpg",
];
const pillarIcons = [HeartHandshake, HandHeart, Stethoscope, UsersRound];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, activities, posts] = await Promise.all([getDictionary(lang), getActivities(), getPosts(3)]);
  const h = t.home;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "ONG AICHA",
    alternateName: t.meta.fullName,
    foundingDate: "2019",
    url: "https://ongaicha.org",
    logo: "https://ongaicha.org/logo.png",
    address: { "@type": "PostalAddress", addressLocality: "Port-Bouët, Abidjan", addressCountry: "CI" },
    telephone: "+2250708999626",
    email: "ongaicha2022@gmail.com",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden text-white">
        <HeroSlider images={heroImages} />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
          <p className="reveal text-sm font-semibold uppercase tracking-widest text-gold">{h.heroEyebrow}</p>
          <h1 className="reveal mt-3 max-w-3xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">{h.heroTitle}</h1>
          <p className="reveal mt-5 max-w-2xl text-lg text-green-50/95 sm:text-xl">{h.heroText}</p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            <Link href={`/${lang}/donate`} className="btn btn-gold text-lg">{h.ctaDonate}</Link>
            <Link href={`/${lang}/join`} className="btn btn-outline text-white hover:bg-white hover:text-green-800">{h.ctaJoin}</Link>
          </div>
        </div>
      </section>

      <Section>
        <SectionTitle title={h.pillarsTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.pillars.map((p, i) => {
            const Icon = pillarIcons[i];
            return (
              <div key={p.title} className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700"><Icon /></span>
                <h3 className="mt-4 text-xl font-bold text-green-800">{p.title}</h3>
                <p className="mt-2 text-muted">{p.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <section className="bg-green-50">
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              <Image src="/images/a-propos.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-green-800 sm:text-4xl">{h.aboutTitle}</h2>
              <div className="mt-3 mb-5 h-1 w-16 rounded bg-gold" />
              <p className="text-lg leading-relaxed text-ink/90">{h.aboutText}</p>
              <Link href={`/${lang}/about`} className="btn btn-primary mt-6">{t.common.learnMore}</Link>
            </div>
          </div>
        </Section>
      </section>

      <section className="bg-green-800 text-white">
        <Section>
          <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">{h.statsTitle}</h2>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {h.stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-5xl font-bold text-gold">{s.value}</dd>
                <p className="mt-2 text-green-50/90">{s.label}</p>
              </div>
            ))}
          </dl>
        </Section>
      </section>

      {activities.length > 0 && (
        <Section>
          <SectionTitle title={h.activitiesTitle} lead={h.activitiesLead} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.slice(0, 6).map((a) => <ActivityCard key={a.id} a={a} lang={lang} label={t.common.readMore} />)}
          </div>
          <div className="mt-10 text-center"><Link href={`/${lang}/activities`} className="btn btn-outline text-green-700">{t.common.seeAll}</Link></div>
        </Section>
      )}

      <section className="bg-cream">
        <Section>
          <SectionTitle title={h.involveTitle} />
          <div className="grid gap-6 md:grid-cols-3">
            {h.involve.map((x, i) => (
              <div key={x.title} className="flex flex-col rounded-3xl bg-white p-8 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-green-800">{x.title}</h3>
                <p className="mt-3 flex-1 text-muted">{x.text}</p>
                <Link href={`/${lang}/${["donate", "sponsor", "join"][i]}`} className={`btn mt-6 ${i === 0 ? "btn-gold" : "btn-primary"}`}>{x.cta}</Link>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {posts.length > 0 && (
        <Section>
          <SectionTitle title={h.newsTitle} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} p={p} lang={lang} label={t.common.readMore} />)}
          </div>
          <div className="mt-10 text-center"><Link href={`/${lang}/blog`} className="btn btn-outline text-green-700">{t.common.seeAll}</Link></div>
        </Section>
      )}
    </>
  );
}

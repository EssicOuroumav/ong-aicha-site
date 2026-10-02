import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, HandHeart, HeartHandshake, Stethoscope, UsersRound } from "lucide-react";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getActivities, getPosts } from "@/lib/content";
import { Section, SectionTitle } from "@/components/ui";
import { ActivityCard, PhotoCard, PostCard } from "@/components/Cards";
import { HeroCarousel, type Slide } from "@/components/HeroCarousel";
import { Partners } from "@/components/Partners";

export const revalidate = 60;

const pillarIcons = [HeartHandshake, HandHeart, Stethoscope, UsersRound];
const pillarImages = ["/images/ramadan-paniers-2025-01.jpg", "/images/tabaski-habits-neufs-2025-01.jpg", "/images/vague-rose-bouake-2025-04.jpg", "/images/vague-rose-port-bouet-2025-06.jpg"];
const pillarLinks = ["/sponsor", "/activities", "/activities", "/help"];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, activities, posts] = await Promise.all([getDictionary(lang), getActivities(), getPosts(3)]);
  const h = t.home;

  // Bandeau : une diapositive de présentation, puis une par activité (photos distinctes)
  const seen = new Set<string>();
  const activitySlides: Slide[] = activities
    .filter((a) => a.coverImage && !seen.has(a.coverImage) && !!seen.add(a.coverImage))
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      image: a.coverImage as string,
      eyebrow: (a.category && (t.activities.filters as Record<string, string>)[a.category]) || t.nav.activities,
      title: pick(a.title, lang),
      text: pick(a.summary, lang),
      primary: { href: `/${lang}/activities/${a.slug}`, label: t.common.discover },
      secondary: { href: `/${lang}/donate`, label: t.nav.donate },
    }));
  const slides: Slide[] = [
    { id: "intro", image: "/images/vague-rose-port-bouet-2025-05.jpg", eyebrow: h.heroEyebrow, title: h.heroTitle, text: h.heroText,
      primary: { href: `/${lang}/donate`, label: h.ctaDonate }, secondary: { href: `/${lang}/join`, label: h.ctaJoin } },
    ...activitySlides,
  ];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "NGO", name: "ONG AICHA", alternateName: t.meta.fullName, foundingDate: "2019",
    url: "https://ongaicha.org", logo: "https://ongaicha.org/logo.png",
    address: { "@type": "PostalAddress", addressLocality: "Port-Bouët, Abidjan", addressCountry: "CI" },
    telephone: "+2250708999626", email: "ongaicha2022@gmail.com",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroCarousel slides={slides} labels={{ previous: t.gallery.previous, next: t.gallery.next, slide: h.hero.slideLabel, pause: h.hero.pause, play: h.hero.play }} />

      <Section>
        <SectionTitle eyebrow={h.eyebrows.mission} title={h.pillarsTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.pillars.map((p, i) => (
            <PhotoCard key={p.title} icon={pillarIcons[i]} title={p.title} text={p.text} image={pillarImages[i]} href={`/${lang}${pillarLinks[i]}`} />
          ))}
        </div>
      </Section>

      <section className="bg-green-50/50">
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              <Image src="/images/a-propos.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <p className="eyebrow mb-4">{h.eyebrows.about}</p>
              <h2 className="text-4xl text-green-950 sm:text-5xl">{h.aboutTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/85">{h.aboutText}</p>
              <Link href={`/${lang}/about`} className="btn btn-primary btn-caps mt-8">{t.common.learnMore}</Link>
            </div>
          </div>
        </Section>
      </section>

      <section className="bg-green-950 text-white">
        <Section>
          <SectionTitle eyebrow={h.eyebrows.stats} title={h.statsTitle} light />
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.stats.map((s) => (
              <div key={s.label} className="glass-green rounded-3xl p-7">
                <dd className="font-display text-6xl font-extrabold tracking-tight text-gold">{s.value}</dd>
                <dt className="mt-3 text-green-50/85">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Section>
      </section>

      {activities.length > 0 && (
        <Section>
          <SectionTitle eyebrow={h.eyebrows.actions} title={h.activitiesTitle} lead={h.activitiesLead} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.slice(0, 6).map((a) => <ActivityCard key={a.id} a={a} lang={lang} />)}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${lang}/activities`} className="inline-flex items-center gap-2 text-lg font-bold text-green-800 hover:text-green-700">
              {t.common.seeAllPrograms} <ArrowRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>
        </Section>
      )}

      <section>
        <Section>
          <SectionTitle eyebrow={h.eyebrows.involve} title={h.involveTitle} />
          <div className="grid gap-6 md:grid-cols-3">
            {h.involve.map((x, i) => (
              <div key={x.title} className="glass lift flex flex-col rounded-3xl p-8">
                <h3 className="text-3xl text-green-950">{x.title}</h3>
                <p className="mt-3 flex-1 text-muted">{x.text}</p>
                <Link href={`/${lang}/${["donate", "sponsor", "join"][i]}`} className={`btn btn-caps mt-6 ${i === 0 ? "btn-gold" : "btn-primary"}`}>{x.cta}</Link>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {posts.length > 0 && (
        <Section>
          <SectionTitle eyebrow={h.eyebrows.news} title={h.newsTitle} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} p={p} lang={lang} label={t.common.readMore} />)}
          </div>
          <div className="mt-10 text-center"><Link href={`/${lang}/blog`} className="btn btn-outline btn-caps text-green-800">{t.common.seeAll}</Link></div>
        </Section>
      )}

      <Section>
        <SectionTitle eyebrow={h.eyebrows.video} title={h.videoTitle} lead={h.videoLead} />
        <div className="glass mx-auto max-w-4xl overflow-hidden rounded-3xl p-2">
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe className="h-full w-full" loading="lazy" title={h.videoTitle} src="https://www.youtube-nocookie.com/embed/p8BbKY_9Ftw" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
          </div>
        </div>
      </Section>

      <Partners t={t} />
    </>
  );
}

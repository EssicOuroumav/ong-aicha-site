import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { PageHero, Section, SectionTitle } from "@/components/ui";
import { Partners } from "@/components/Partners";
import { PhotoCard } from "@/components/Cards";
import { BookOpen, HandHeart, HeartHandshake, Stethoscope } from "lucide-react";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).about.title, alternates: alternatesFor(lang, "/about") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const { about } = t;
  return (
    <>
      <PageHero title={about.title} lead={about.lead} />
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src="/images/a-propos.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-4">{t.home.eyebrows.about}</p>
            <h2 className="mb-5 text-4xl text-green-950 sm:text-5xl">{about.storyTitle}</h2>
            {about.story.map((p) => <p key={p} className="mb-4 text-lg leading-relaxed text-ink/90">{p}</p>)}
          </div>
        </div>
      </Section>
      <section className="bg-green-50/50">
        <Section>
          <SectionTitle eyebrow={t.home.eyebrows.about} title={about.objectivesTitle} />
          <ol className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {about.objectives.map((o, i) => (
              <li key={o} className="glass flex gap-4 rounded-2xl p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 font-bold text-white">{i + 1}</span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </Section>
      </section>
      <Section>
        <SectionTitle eyebrow={t.home.eyebrows.domains} title={about.domainsTitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {about.domains.map((d, i) => (
            <PhotoCard key={d.title} icon={[Stethoscope, BookOpen, HandHeart, HeartHandshake][i] ?? HeartHandshake}
              title={d.title} text={d.text} image={["/images/vague-rose-bouake-2025-04.jpg", "/images/tabaski-habits-neufs-2025-01.jpg", "/images/ramadan-paniers-2025-01.jpg", "/images/nuit-solidarite-2024-01.jpg"][i] ?? "/images/a-propos.jpg"}
              href={`/${lang}/activities`} />
          ))}
        </div>
      </Section>
      <section className="bg-green-50/50">
        <Section>
          <SectionTitle eyebrow={t.home.eyebrows.timeline} title={about.timelineTitle} />
          <ol className="relative mx-auto max-w-3xl border-s-2 border-green-700/30 ps-8">
            {about.timeline.map((e, i) => (
              <li key={i} className="mb-8 last:mb-0">
                <span className="absolute -start-[11px] mt-1.5 h-5 w-5 rounded-full border-4 border-white bg-green-700" />
                <p className="text-sm font-bold text-green-700">{e.year}</p>
                <h3 className="text-lg font-bold text-green-900">{e.title}</h3>
                <p className="text-muted">{e.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      </section>
      <Section>
        <SectionTitle title={about.valuesTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v) => (
            <div key={v.title} className="glass lift rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-green-800">{v.title}</h3>
              <p className="mt-2 text-muted">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          <div><h3 className="text-2xl font-bold text-green-800">{about.fundingTitle}</h3><p className="mt-3 text-muted">{about.funding}</p></div>
          <div><h3 className="text-2xl font-bold text-green-800">{about.leadershipTitle}</h3><p className="mt-3 text-muted">{about.leadership}</p></div>
        </div>
      </Section>
      <Partners t={t} />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHero, Section, SectionTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).about.title };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { about } = await getDictionary(lang);
  return (
    <>
      <PageHero title={about.title} lead={about.lead} />
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src="/images/a-propos.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-green-800">{about.storyTitle}</h2>
            <div className="mt-2 mb-5 h-1 w-16 rounded bg-gold" />
            {about.story.map((p) => <p key={p} className="mb-4 text-lg leading-relaxed text-ink/90">{p}</p>)}
          </div>
        </div>
      </Section>
      <section className="bg-green-50">
        <Section>
          <SectionTitle title={about.objectivesTitle} />
          <ol className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {about.objectives.map((o, i) => (
              <li key={o} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 font-bold text-white">{i + 1}</span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </Section>
      </section>
      <Section>
        <SectionTitle title={about.valuesTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-line bg-white p-6 text-center">
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
    </>
  );
}

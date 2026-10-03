import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/legal">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).legal.title, alternates: alternatesFor(lang, "/legal") };
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { legal } = await getDictionary(lang);
  return (
    <>
      <PageHero title={legal.title} />
      <Section><div className="prose-aicha mx-auto max-w-3xl text-lg">{legal.body.map((p) => <p key={p}>{p}</p>)}</div></Section>
    </>
  );
}

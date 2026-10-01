import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHero, Section } from "@/components/ui";
import { JoinForm } from "@/components/Forms";

export async function generateMetadata({ params }: PageProps<"/[lang]/join">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).join.title };
}

export default async function JoinPage({ params }: PageProps<"/[lang]/join">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  return (
    <>
      <PageHero title={t.join.title} lead={t.join.lead} />
      <Section><div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10"><JoinForm t={t} /></div></Section>
    </>
  );
}

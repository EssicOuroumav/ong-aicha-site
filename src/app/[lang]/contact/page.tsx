import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/settings";
import { PageHero, Section } from "@/components/ui";
import { ContactForm } from "@/components/Forms";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).contact.title };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, s] = await Promise.all([getDictionary(lang), getSettings()]);
  return (
    <>
      <PageHero title={t.contact.title} lead={t.contact.lead} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3 glass rounded-3xl p-6 sm:p-10"><ContactForm t={t} /></div>
          <aside className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-green-800">{t.contact.infoTitle}</h2>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-4"><Phone className="mt-1 text-gold-dark" /><div><p className="font-semibold">{t.contact.phone}</p><p dir="ltr" className="text-muted">{s.phone}</p></div></li>
              <li className="flex gap-4"><Mail className="mt-1 text-gold-dark" /><div><p className="font-semibold">{t.contact.emailLabel}</p><a className="text-muted hover:text-green-700" href={`mailto:${s.email}`}>{s.email}</a></div></li>
              <li className="flex gap-4"><MapPin className="mt-1 text-gold-dark" /><div><p className="font-semibold">{t.contact.address}</p><p className="text-muted">{s.address}</p></div></li>
            </ul>
            <a href={`https://wa.me/${s.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-6 w-full">{t.common.whatsapp}</a>
            <div className="mt-8 overflow-hidden rounded-2xl border border-line">
              <iframe title="Carte" loading="lazy" className="h-64 w-full" referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=ONG+AICHA+Port-Bouet+Abidjan&output=embed" />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

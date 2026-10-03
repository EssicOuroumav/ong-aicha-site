import type { Metadata } from "next";
import { Inter_Tight, Inter, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { dirOf, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/settings";

const display = Inter_Tight({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
// Cairo n'est préchargée que pour l'arabe (inutile sur les pages FR/EN : ~50 Ko en moins sur le chemin critique)
const arabic = Cairo({ subsets: ["arabic", "latin"], variable: "--font-arabic", display: "swap", preload: false });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ongaicha.org";
  return {
    metadataBase: new URL(base),
    title: { default: `${t.meta.siteName} – ${t.meta.tagline}`, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
    openGraph: { siteName: t.meta.siteName, locale: lang, type: "website", images: ["/images/og.jpg"] },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const settings = await getSettings();

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${display.variable} ${body.variable} ${arabic.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded">
          {t.nav.skip}
        </a>
        <Header lang={lang} t={t} />
        <main id="main" className="flex-1">{children}</main>
        <Footer lang={lang} t={t} settings={settings} />
      </body>
    </html>
  );
}

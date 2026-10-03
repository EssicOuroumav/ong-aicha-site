import { locales, type Locale } from "@/i18n/config";

/** Adresse canonique et versions linguistiques d'UNE page (hreflang correct page par page). */
export function alternatesFor(lang: Locale, path: string) {
  return {
    canonical: `/${lang}${path}`,
    languages: { ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])), "x-default": `/fr${path}` },
  };
}

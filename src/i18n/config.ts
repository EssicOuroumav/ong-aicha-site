export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** Texte trilingue stocké en JSON : { fr, en, ar } */
export type Localized = Partial<Record<Locale, string>>;

export function pick(value: unknown, locale: Locale): string {
  if (!value || typeof value !== "object") return typeof value === "string" ? value : "";
  const v = value as Localized;
  return v[locale] || v.fr || v.en || v.ar || "";
}

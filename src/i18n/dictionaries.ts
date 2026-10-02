import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { applyList, LIST_KEYS, setText, type Dict } from "@/lib/overrides";
import type { Locale } from "./config";

const dictionaries = {
  fr: () => import("../messages/fr.json").then((m) => m.default),
  en: () => import("../messages/en.json").then((m) => m.default),
  ar: () => import("../messages/ar.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["fr"]>>;

/** Dictionnaire de base (fichiers) + textes et listes modifiés depuis l'admin. Une lecture par requête. */
export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const dict = structuredClone(await dictionaries[locale]()) as unknown as Dict;
  try {
    const [texts, lists] = await Promise.all([
      db.textOverride.findMany({ where: { lang: locale } }),
      db.contentList.findMany({ where: { key: { in: [...LIST_KEYS] } } }),
    ]);
    for (const t of texts) setText(dict, t.key, t.value);
    for (const l of lists) applyList(dict, l.key as (typeof LIST_KEYS)[number], l.data, locale);
  } catch (e) {
    console.error("[dictionnaire] surcharges ignorées", e);
  }
  return dict as unknown as Dictionary;
});

/** Dictionnaires de base bruts (admin : valeurs d'origine pour l'édition) */
export const getBaseDictionaries = async () => ({
  fr: await dictionaries.fr(),
  en: await dictionaries.en(),
  ar: await dictionaries.ar(),
});

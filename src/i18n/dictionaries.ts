import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  fr: () => import("../messages/fr.json").then((m) => m.default),
  en: () => import("../messages/en.json").then((m) => m.default),
  ar: () => import("../messages/ar.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["fr"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  (await dictionaries[locale]()) as Dictionary;

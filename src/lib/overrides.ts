// Fonctions pures (testées) : lecture/écriture d'un texte dans le dictionnaire par chemin "a.b[2].c"

export type Dict = Record<string, unknown>;

export function parsePath(path: string): (string | number)[] {
  const out: (string | number)[] = [];
  for (const part of path.split(".")) {
    const m = part.match(/^([^[\]]+)((?:\[\d+\])*)$/);
    if (!m) return [];
    out.push(m[1]);
    for (const idx of m[2].matchAll(/\[(\d+)\]/g)) out.push(Number(idx[1]) - 1);
  }
  return out;
}

export function flatten(value: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(value)) value.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i + 1}]`)));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  else if (typeof value === "string") out[prefix] = value;
  return out;
}

/** Remplace une feuille de texte existante ; ignore les chemins inconnus (aucune clé arbitraire n'est créée). */
export function setText(dict: Dict, path: string, value: string): boolean {
  const keys = parsePath(path);
  if (!keys.length) return false;
  let node: unknown = dict;
  for (const k of keys.slice(0, -1)) {
    if (node === null || typeof node !== "object" || !(k in (node as object))) return false;
    node = (node as Record<string | number, unknown>)[k];
  }
  const last = keys[keys.length - 1];
  if (node === null || typeof node !== "object" || typeof (node as Record<string | number, unknown>)[last] !== "string") return false;
  (node as Record<string | number, unknown>)[last] = value;
  return true;
}

export const LIST_KEYS = ["partners", "faq", "timeline", "stats"] as const;
export type ListKey = (typeof LIST_KEYS)[number];
// Chemins du dictionnaire remplacés par chaque liste (ces textes ne sont pas dans l'éditeur « textes »)
export const LIST_PATHS: Record<ListKey, string> = { partners: "partners.items", faq: "donate.faq", timeline: "about.timeline", stats: "home.stats" };

type L = { fr?: string; en?: string; ar?: string };
const pickL = (v: L | string | undefined, lang: keyof L): string => (typeof v === "string" ? v : v?.[lang] || v?.fr || "");

export function applyList(dict: Dict, key: ListKey, data: unknown, lang: keyof L) {
  if (!Array.isArray(data)) return;
  const items = data as Record<string, L | string>[];
  const d = dict as { partners: { items: unknown }; donate: { faq: unknown }; about: { timeline: unknown }; home: { stats: unknown } };
  if (key === "partners") d.partners.items = items.map((i) => ({ name: pickL(i.name, lang), logo: typeof i.logo === "string" ? i.logo : "" })).filter((i) => i.name);
  if (key === "faq") d.donate.faq = items.map((i) => ({ q: pickL(i.q, lang), a: pickL(i.a, lang) })).filter((i) => i.q);
  if (key === "timeline") d.about.timeline = items.map((i) => ({ year: String(i.year ?? ""), title: pickL(i.title, lang), text: pickL(i.text, lang) }));
  if (key === "stats") d.home.stats = items.map((i) => ({ value: String(i.value ?? ""), label: pickL(i.label, lang) }));
}

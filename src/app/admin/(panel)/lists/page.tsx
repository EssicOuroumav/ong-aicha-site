import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { getBaseDictionaries } from "@/i18n/dictionaries";
import { resetList, saveList } from "@/actions/admin";
import { Card, Title } from "@/components/admin/ui";
import { ListEditor, type FieldDef } from "@/components/admin/ListEditor";

export const dynamic = "force-dynamic";
type Loc = { fr: string; en: string; ar: string };

export default async function ListsPage() {
  await requireArea("content");
  const base = await getBaseDictionaries();
  const saved = new Map((await db.contentList.findMany()).map((l) => [l.key, l.data as Record<string, unknown>[]]));
  const L = (get: (d: typeof base.fr) => string | undefined): Loc => ({ fr: get(base.fr) ?? "", en: get(base.en) ?? "", ar: get(base.ar) ?? "" });

  const defaults = {
    partners: base.fr.partners.items.map((it, i) => ({ name: L((d) => d.partners.items[i]?.name), logo: it.logo })),
    faq: base.fr.donate.faq.map((_, i) => ({ q: L((d) => d.donate.faq[i]?.q), a: L((d) => d.donate.faq[i]?.a) })),
    timeline: base.fr.about.timeline.map((e, i) => ({ year: e.year, title: L((d) => d.about.timeline[i]?.title), text: L((d) => d.about.timeline[i]?.text) })),
    stats: base.fr.home.stats.map((s, i) => ({ value: s.value, label: L((d) => d.home.stats[i]?.label) })),
  };
  const lists: { key: keyof typeof defaults; title: string; hint: string; itemLabel: string; fields: FieldDef[] }[] = [
    { key: "partners", title: "Partenaires", hint: "Affichés sur l'accueil et la page À propos (nom de l'organisation).", itemLabel: "Partenaire", fields: [{ name: "name", label: "Nom", kind: "loc" }, { name: "logo", label: "Logo (image)", kind: "image" }] },
    { key: "faq", title: "Questions fréquentes (page Don)", hint: "Questions et réponses sous le formulaire de don.", itemLabel: "Question", fields: [{ name: "q", label: "Question", kind: "loc" }, { name: "a", label: "Réponse", kind: "loc", multiline: true }] },
    { key: "timeline", title: "Frise « Nos temps forts » (page À propos)", hint: "Les événements marquants, dans l'ordre d'affichage.", itemLabel: "Événement", fields: [{ name: "year", label: "Année", kind: "text" }, { name: "title", label: "Titre", kind: "loc" }, { name: "text", label: "Texte", kind: "loc", multiline: true }] },
    { key: "stats", title: "Chiffres de l'accueil", hint: "Jusqu'à 8 chiffres clés (ex. valeur « 710 », texte « familles aidées »).", itemLabel: "Chiffre", fields: [{ name: "value", label: "Valeur", kind: "text" }, { name: "label", label: "Texte", kind: "loc" }] },
  ];
  return (
    <>
      <Title>Listes (partenaires, FAQ, frise, chiffres)</Title>
      <p className="mb-6 max-w-3xl text-sm text-muted">Ajoutez, supprimez ou réordonnez les éléments. Chaque texte est à saisir en français, anglais et arabe (si une langue est vide, le français est affiché).</p>
      <div className="space-y-3">
        {lists.map((l) => (
          <details key={l.key} className="rounded-2xl border border-line bg-white shadow-sm">
            <summary className="cursor-pointer p-4 font-semibold text-green-900">{l.title} <span className="ms-2 text-sm font-normal text-muted">{l.hint}</span>{saved.has(l.key) && <span className="ms-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">modifiée</span>}</summary>
            <div className="border-t border-line p-4">
              <ListEditor listKey={l.key} fields={l.fields} itemLabel={l.itemLabel} saveAction={saveList} resetAction={resetList}
                initial={(saved.get(l.key) ?? defaults[l.key]) as never} />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}

import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { getBaseDictionaries } from "@/i18n/dictionaries";
import { flatten } from "@/lib/overrides";
import { editableKeys, resetTexts, saveTexts } from "@/actions/admin";
import { Card, Title } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const sections: [string, string, string][] = [
  ["nav", "Menus", "Les onglets de la barre du haut"],
  ["home", "Accueil", "Titre, texte d'introduction, mission, « Qui sommes-nous », comment agir…"],
  ["about", "À propos", "Histoire, objectifs, valeurs, domaines d'action, financement, direction"],
  ["activities", "Actions", "Titres et libellés de la page des actions"],
  ["donate", "Faire un don", "Textes du formulaire et de la page de don"],
  ["sponsor", "Parrainage", "Textes de la page de parrainage"],
  ["join", "Adhésion", "Textes de la page d'adhésion"],
  ["help", "Demande d'aide", "Textes de la page « Demander de l'aide »"],
  ["contact", "Contact", "Textes de la page de contact"],
  ["blog", "Actualités", "Titres de la page des articles"],
  ["gallery", "Galerie", "Libellés de la galerie"],
  ["footer", "Pied de page", "Textes du bas de chaque page"],
  ["legal", "Mentions légales", "Paragraphes des mentions légales (à faire relire par un juriste)"],
  ["partners", "Partenaires (titre)", "Titre et introduction de la section partenaires"],
  ["common", "Boutons et mentions communes", "Boutons, consentement, messages d'erreur"],
  ["meta", "Référencement", "Slogan et description du site (moteurs de recherche)"],
  ["notFound", "Page introuvable", "Message de la page 404"],
];
const labels = { fr: "Français", en: "English", ar: "العربية" } as const;

export default async function TextsPage() {
  await requireArea("content");
  const base = await getBaseDictionaries();
  const flat = { fr: flatten(base.fr), en: flatten(base.en), ar: flatten(base.ar) };
  const overrides = await db.textOverride.findMany();
  const ov = new Map(overrides.map((o) => [`${o.key}||${o.lang}`, o.value]));
  return (
    <>
      <Title>Textes du site</Title>
      <p className="mb-6 max-w-3xl text-sm text-muted">
        Modifiez ici les textes fixes du site dans les trois langues. Les champs affichent le texte actuellement en ligne. Videz un champ ou remettez le texte d'origine pour revenir à la version de base. Les listes (partenaires, FAQ, frise, chiffres de l'accueil) sont dans « Listes ».
      </p>
      <div className="space-y-3">
        {await Promise.all(sections.map(async ([id, title, hint]) => {
          const keys = await editableKeys(id);
          if (!keys.length) return null;
          const changed = keys.filter((k) => (["fr", "en", "ar"] as const).some((l) => ov.has(`${k}||${l}`))).length;
          return (
            <details key={id} className="rounded-2xl border border-line bg-white shadow-sm">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-4 font-semibold text-green-900">
                <span>{title} <span className="ms-2 text-sm font-normal text-muted">{hint}</span></span>
                {changed > 0 && <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-800">{changed} modifié{changed > 1 ? "s" : ""}</span>}
              </summary>
              <div className="border-t border-line p-4">
                <form action={saveTexts} className="space-y-6">
                  <input type="hidden" name="section" value={id} />
                  {keys.map((k) => (
                    <fieldset key={k} className="space-y-2 rounded-xl bg-green-50/40 p-3">
                      <legend className="px-1 text-xs text-muted">{k}</legend>
                      {(["fr", "en", "ar"] as const).map((l) => {
                        const v = ov.get(`${k}||${l}`) ?? flat[l][k] ?? "";
                        const long = (flat[l][k] ?? "").length > 70 || v.length > 70;
                        const name = `${k}||${l}`;
                        return (
                          <div key={l}>
                            <label htmlFor={name} className="text-xs text-muted">{labels[l]}{ov.has(name) && " · modifié"}</label>
                            {long
                              ? <textarea id={name} name={name} defaultValue={v} rows={Math.min(8, Math.ceil(v.length / 90) + 1)} dir={l === "ar" ? "rtl" : "ltr"} className="field" />
                              : <input id={name} name={name} defaultValue={v} dir={l === "ar" ? "rtl" : "ltr"} className="field" />}
                          </div>
                        );
                      })}
                    </fieldset>
                  ))}
                  <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl bg-white/90 p-3 shadow backdrop-blur">
                    <button className="btn btn-primary">Enregistrer « {title} »</button>
                    <button formAction={resetTexts} className="btn btn-outline text-red-700" formNoValidate>Revenir aux textes d'origine</button>
                  </div>
                </form>
              </div>
            </details>
          );
        }))}
      </div>
    </>
  );
}

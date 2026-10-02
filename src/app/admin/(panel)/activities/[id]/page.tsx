import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { deleteActivity, saveActivity } from "@/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Title, TrilingualField } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";

export const dynamic = "force-dynamic";

export default async function EditActivity({ params }: PageProps<"/admin/activities/[id]">) {
  await requireArea("content");
  const { id } = await params;
  const a = id === "new" ? null : await db.activity.findUnique({ where: { id } });
  if (id !== "new" && !a) notFound();
  return (
    <>
      <Title>{a ? "Modifier l'action" : "Nouvelle action"}</Title>
      <form action={saveActivity} className="space-y-6">
        {a && <input type="hidden" name="id" value={a.id} />}
        <Card className="space-y-5">
          <TrilingualField name="title" label="Titre" value={a?.title} />
          <TrilingualField name="summary" label="Résumé court" value={a?.summary} rows={2} />
          <TrilingualField name="description" label="Description (paragraphes séparés par une ligne vide)" value={a?.description} rows={8} />
          <TrilingualField name="period" label="Période (ex. Septembre, Octobre…)" value={a?.period} />
        </Card>
        <Card className="space-y-4">
          <div>
            <h2 className="font-bold text-green-800">Chiffres d'impact (jusqu'à 4)</h2>
            <p className="text-sm text-muted">Affichés sur la page de l'action. Exemple : valeur « 710 », texte « familles aidées ». Laissez vide pour ne rien afficher.</p>
          </div>
          {[1, 2, 3, 4].map((i) => {
            const it = ((Array.isArray(a?.impact) ? a?.impact : []) as { value: string; label: unknown }[])[i - 1];
            return (
              <fieldset key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-4">
                <legend className="px-1 text-xs text-muted">Chiffre {i}</legend>
                <input name={`impact_value_${i}`} defaultValue={it?.value ?? ""} placeholder="Valeur (ex. 710)" aria-label={`Valeur du chiffre ${i}`} className="field" />
                {(["fr", "en", "ar"] as const).map((l) => (
                  <input key={l} name={`impact_label_${i}_${l}`} defaultValue={(it?.label as Record<string, string> | undefined)?.[l] ?? ""} placeholder={`Texte (${l})`} aria-label={`Texte ${l} du chiffre ${i}`} dir={l === "ar" ? "rtl" : "ltr"} className="field" />
                ))}
              </fieldset>
            );
          })}
        </Card>
        <Card className="space-y-4">
          <ImageField name="coverImage" label="Image" initial={a?.coverImage} />
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-semibold">Catégorie (filtre sur la page Actions)</label>
            <select id="category" name="category" defaultValue={a?.category ?? ""} className="field max-w-xs">
              <option value="">Aucune</option><option value="health">Santé</option><option value="education">Éducation</option><option value="social">Aide sociale</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="location" className="mb-1 block text-sm font-semibold">Lieu</label><input id="location" name="location" defaultValue={a?.location ?? ""} className="field" /></div>
            <div><label htmlFor="order" className="mb-1 block text-sm font-semibold">Ordre d'affichage</label><input id="order" name="order" type="number" defaultValue={a?.order ?? 0} className="field" /></div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={a?.published ?? true} className="h-5 w-5 accent-green-700" /> Publié</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={a?.featured ?? false} className="h-5 w-5 accent-green-700" /> Afficher dans le bandeau défilant de l'accueil (avec sa photo)</label>
        </Card>
        <button className="btn btn-primary">Enregistrer</button>
      </form>
      {a && <form action={deleteActivity} className="mt-6"><input type="hidden" name="id" value={a.id} /><ConfirmButton message="Supprimer définitivement cette action ?" className="text-sm text-red-700 underline">Supprimer cette action</ConfirmButton></form>}
    </>
  );
}

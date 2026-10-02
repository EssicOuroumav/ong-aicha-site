import { requireArea } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/actions/admin";
import { Card, Title } from "@/components/admin/ui";
import { SaveForm } from "@/components/admin/SaveForm";

export const dynamic = "force-dynamic";
const fields = [
  ["phone", "Téléphone"], ["donationPhone", "Téléphone Mobile Money (dons)"], ["email", "E-mail de contact"],
  ["address", "Adresse"], ["facebook", "Lien Facebook"], ["youtube", "Lien YouTube"], ["instagram", "Lien Instagram"],
] as const;

export default async function SettingsPage() {
  await requireArea("settings");
  const s = await getSettings();
  return (
    <>
      <Title>Réglages du site</Title>
      <Card>
        <SaveForm action={saveSettings}>
          {fields.map(([k, label]) => (
            <div key={k}><label htmlFor={k} className="mb-1 block text-sm font-semibold">{label}</label><input id={k} name={k} defaultValue={s[k]} className="field" /></div>
          ))}
        </SaveForm>
      </Card>
      <Card className="mt-6">
        <h2 className="font-bold text-green-800">Sauvegarde des données</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Téléchargez une copie complète des données du site (dons, demandes, contenus, comptes sans mots de passe) au format JSON. Le fichier contient des données personnelles : conservez-le en lieu sûr, jamais dans un dossier partagé. Faites-le au moins une fois par mois et avant toute grosse modification.</p>
        <a href="/admin/backup/export" className="btn btn-primary mt-4">Télécharger une sauvegarde</a>
      </Card>
    </>
  );
}

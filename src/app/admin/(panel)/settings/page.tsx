import { requireArea } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/actions/admin";
import { Card, Title } from "@/components/admin/ui";

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
        <form action={saveSettings} className="space-y-4">
          {fields.map(([k, label]) => (
            <div key={k}><label htmlFor={k} className="mb-1 block text-sm font-semibold">{label}</label><input id={k} name={k} defaultValue={s[k]} className="field" /></div>
          ))}
          <button className="btn btn-primary">Enregistrer</button>
        </form>
      </Card>
    </>
  );
}

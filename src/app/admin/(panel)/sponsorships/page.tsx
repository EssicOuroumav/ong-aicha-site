import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { remindSponsor, setSponsorship } from "@/actions/admin";
import { Badge, StatusSelect, Table, Title, dt } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const freq = { MONTHLY: "Mensuelle", QUARTERLY: "Trimestrielle", YEARLY: "Annuelle" };

export default async function SponsorshipsPage({ searchParams }: PageProps<"/admin/sponsorships">) {
  await requireArea("requests");
  const { reminder } = await searchParams;
  const items = await db.sponsorship.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <Title>Parrainages</Title>
      {reminder && <p role="status" className={`mb-4 rounded-xl p-3 ${reminder === "ok" ? "bg-green-100 text-green-900" : "bg-amber-50 text-amber-900"}`}>{reminder === "ok" ? "Rappel envoyé avec le lien de paiement." : `Rappel non envoyé : ${reminder}`}</p>}
      <p className="mb-4 text-sm text-muted">Validez une demande et indiquez le montant par enfant et par échéance : un e-mail de rappel avec lien de paiement est ensuite envoyé automatiquement à chaque échéance (ou manuellement ci-dessous).</p>
      <Table head={["Reçu le", "Parrain", "Enfants", "Fréquence", "Prochaine échéance", "Statut / montant par enfant", "Rappel"]}>
        {items.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3 whitespace-nowrap">{dt(s.createdAt)}</td>
            <td className="px-4 py-3"><b>{s.fullName}</b><br /><span className="text-xs text-muted">{s.email} · {s.phone}</span>{s.note && <p className="mt-1 text-xs italic">{s.note}</p>}</td>
            <td className="px-4 py-3">{s.children}</td>
            <td className="px-4 py-3">{freq[s.frequency]}</td>
            <td className="px-4 py-3">{s.nextDueAt ? dt(s.nextDueAt) : "—"}</td>
            <td className="px-4 py-3">
              <form action={setSponsorship} className="flex flex-wrap items-center gap-1">
                <input type="hidden" name="id" value={s.id} />
                <StatusSelect value={s.status} options={["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"]} />
                <input name="amount" type="number" min={0} step={500} defaultValue={s.amount ?? ""} placeholder="FCFA" className="w-24 rounded-lg border border-line px-2 py-1 text-sm" aria-label="Montant par enfant" />
                <button className="rounded-lg bg-green-700 px-2 py-1 text-xs text-white">OK</button>
              </form>
              <Badge status={s.status} />
            </td>
            <td className="px-4 py-3">
              {s.status === "APPROVED" && (
                <form action={remindSponsor}><input type="hidden" name="id" value={s.id} /><button className="rounded-lg border border-green-700 px-3 py-1 text-xs font-semibold text-green-800 hover:bg-green-50">Envoyer le rappel</button></form>
              )}
              {s.lastReminderAt && <p className="mt-1 text-xs text-muted">Dernier : {dt(s.lastReminderAt)}</p>}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

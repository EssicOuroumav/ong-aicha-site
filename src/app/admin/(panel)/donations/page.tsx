import Link from "next/link";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { addManualDonation, setDonationStatus } from "@/actions/admin";
import { Badge, Card, StatusSelect, Table, Title, dt, fcfa } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  await requireArea("donations");
  const donations = await db.donation.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <>
      <Title action={<Link href="/admin/donations/export" className="btn btn-primary !py-2 text-sm">Exporter en CSV</Link>}>Dons</Title>
      <Card className="mb-6">
        <form action={addManualDonation} className="grid gap-3 sm:grid-cols-6">
          <h2 className="font-bold text-green-800 sm:col-span-6">Enregistrer un don reçu hors ligne</h2>
          <input name="donorName" placeholder="Nom du donateur" required className="field sm:col-span-2" aria-label="Nom du donateur" />
          <input name="amount" type="number" min={100} step={100} placeholder="Montant FCFA" required className="field" aria-label="Montant en FCFA" />
          <select name="method" className="field" aria-label="Mode de réception">{["Mobile Money", "Espèces", "Virement", "Chèque", "Autre"].map((m) => <option key={m}>{m}</option>)}</select>
          <select name="cause" className="field" aria-label="Cause">{[["general", "Général"], ["health", "Santé"], ["education", "Éducation"], ["ramadan", "Ramadan/Tabaski"], ["orphans", "Orphelins et veuves"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button className="btn btn-primary">Enregistrer</button>
          <input name="email" type="email" placeholder="E-mail (facultatif)" className="field sm:col-span-3" aria-label="E-mail" />
          <input name="note" placeholder="Note (facultatif)" className="field sm:col-span-3" aria-label="Note" />
        </form>
      </Card>
      <Table head={["Date", "Donateur", "Montant", "Cause", "Référence", "Statut", ""]}>
        {donations.map((d) => (
          <tr key={d.id}>
            <td className="px-4 py-3 whitespace-nowrap">{dt(d.createdAt)}</td>
            <td className="px-4 py-3">{d.anonymous ? <i>Anonyme</i> : d.donorName}<br /><span className="text-xs text-muted">{d.email}</span></td>
            <td className="px-4 py-3 font-semibold">{fcfa(d.amount)}</td>
            <td className="px-4 py-3">{d.cause}</td>
            <td className="px-4 py-3 text-xs">{d.reference}</td>
            <td className="px-4 py-3"><Badge status={d.status} /></td>
            <td className="px-4 py-3">
              <form action={setDonationStatus} className="flex gap-1">
                <input type="hidden" name="id" value={d.id} />
                <StatusSelect value={d.status} options={["PENDING", "COMPLETED", "FAILED", "CANCELLED"]} />
                <button className="rounded-lg bg-green-700 px-2 text-xs text-white">OK</button>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { setDonationStatus } from "@/actions/admin";
import { Badge, StatusSelect, Table, Title, dt, fcfa } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  await requireArea("donations");
  const donations = await db.donation.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <>
      <Title action={<Link href="/admin/donations/export" className="btn btn-primary !py-2 text-sm">Exporter en CSV</Link>}>Dons</Title>
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

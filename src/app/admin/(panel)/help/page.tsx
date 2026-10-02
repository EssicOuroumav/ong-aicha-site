import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { setHelpRequest } from "@/actions/admin";
import { Badge, StatusSelect, Table, Title, dt } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const kinds = { SOS: "Urgence sociale", WIDOW: "Aide aux veuves", OTHER: "Autre besoin" };

export default async function HelpAdmin() {
  await requireArea("requests");
  const items = await db.helpRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <Title>Demandes d'aide</Title>
      <p className="mb-4 text-sm text-muted">Données sensibles : à traiter avec discrétion et à ne partager qu'avec les personnes habilitées.</p>
      <Table head={["Reçue le", "Demandeur", "Type", "Besoin", "Statut"]}>
        {items.map((h) => (
          <tr key={h.id}>
            <td className="px-4 py-3 whitespace-nowrap">{dt(h.createdAt)}</td>
            <td className="px-4 py-3 font-semibold">{h.name}<br /><span className="text-xs font-normal text-muted">{h.phone} {h.email}</span></td>
            <td className="px-4 py-3">{kinds[h.kind]}</td>
            <td className="px-4 py-3 max-w-xs"><b>{h.nature}</b>{h.message && <p className="mt-1 text-xs">{h.message}</p>}</td>
            <td className="px-4 py-3">
              <form action={setHelpRequest} className="flex gap-1"><input type="hidden" name="id" value={h.id} /><StatusSelect value={h.status} options={["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"]} /><button className="rounded-lg bg-green-700 px-2 text-xs text-white">OK</button></form>
              <Badge status={h.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

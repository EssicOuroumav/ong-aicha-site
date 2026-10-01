import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { setMembership } from "@/actions/admin";
import { Badge, StatusSelect, Table, Title, dt } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function MembershipsPage() {
  await requireArea("requests");
  const items = await db.membership.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <Title>Adhésions</Title>
      <Table head={["Reçu le", "Nom", "Type", "Contact", "Message", "Statut"]}>
        {items.map((m) => (
          <tr key={m.id}>
            <td className="px-4 py-3 whitespace-nowrap">{dt(m.createdAt)}</td>
            <td className="px-4 py-3 font-semibold">{m.firstName} {m.lastName}<br /><span className="text-xs font-normal text-muted">{m.city}</span></td>
            <td className="px-4 py-3">{m.type === "MEMBER" ? "Membre" : "Bénévole"}</td>
            <td className="px-4 py-3 text-xs">{m.phone}<br />{m.email}</td>
            <td className="px-4 py-3 max-w-xs text-xs">{m.message}</td>
            <td className="px-4 py-3">
              <form action={setMembership} className="flex gap-1"><input type="hidden" name="id" value={m.id} /><StatusSelect value={m.status} options={["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"]} /><button className="rounded-lg bg-green-700 px-2 text-xs text-white">OK</button></form>
              <Badge status={m.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

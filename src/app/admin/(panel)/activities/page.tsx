import Link from "next/link";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { Badge, Table, Title } from "@/components/admin/ui";
import { pick } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function ActivitiesAdmin() {
  await requireArea("content");
  const items = await db.activity.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <Title action={<Link href="/admin/activities/new" className="btn btn-primary !py-2 text-sm">Nouvelle action</Link>}>Actions de terrain</Title>
      <Table head={["Ordre", "Titre", "Statut", ""]}>
        {items.map((a) => (
          <tr key={a.id}>
            <td className="px-4 py-3">{a.order}</td>
            <td className="px-4 py-3 font-semibold">{pick(a.title, "fr")}</td>
            <td className="px-4 py-3"><Badge status={a.published ? "COMPLETED" : "PENDING"} /></td>
            <td className="px-4 py-3"><Link className="text-green-700 underline" href={`/admin/activities/${a.id}`}>Modifier</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

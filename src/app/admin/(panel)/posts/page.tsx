import Link from "next/link";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { Badge, Table, Title, dt } from "@/components/admin/ui";
import { pick } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function PostsAdmin() {
  await requireArea("content");
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <Title action={<Link href="/admin/posts/new" className="btn btn-primary !py-2 text-sm">Nouvel article</Link>}>Blog</Title>
      <Table head={["Titre", "Date", "Statut", ""]}>
        {posts.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3 font-semibold">{pick(p.title, "fr")}</td>
            <td className="px-4 py-3">{p.publishedAt ? dt(p.publishedAt) : "—"}</td>
            <td className="px-4 py-3"><Badge status={p.published ? "COMPLETED" : "PENDING"} /></td>
            <td className="px-4 py-3"><Link className="text-green-700 underline" href={`/admin/posts/${p.id}`}>Modifier</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/guard";
import { Card, Title, fcfa } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  if (user.mustChangePw) redirect("/admin/password");
  const { denied } = await searchParams;
  const showMoney = can(user.role, "donations");
  const [sum, count, spons, members, msgs, posts, helps, errors] = await Promise.all([
    showMoney ? db.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }) : null,
    showMoney ? db.donation.count({ where: { status: "COMPLETED" } }) : 0,
    can(user.role, "requests") ? db.sponsorship.count({ where: { status: "NEW" } }) : 0,
    can(user.role, "requests") ? db.membership.count({ where: { status: "NEW" } }) : 0,
    can(user.role, "requests") ? db.contactMessage.count({ where: { read: false } }) : 0,
    can(user.role, "content") ? db.post.count({ where: { published: true } }) : 0,
    can(user.role, "requests") ? db.helpRequest.count({ where: { status: "NEW" } }) : 0,
    can(user.role, "settings") ? db.errorLog.count({ where: { resolved: false } }) : 0,
  ]);
  const tiles = [
    showMoney && { label: "Dons reçus", value: fcfa(sum?._sum.amount ?? 0), href: "/admin/donations" },
    showMoney && { label: "Nombre de dons", value: String(count), href: "/admin/donations" },
    can(user.role, "requests") && { label: "Parrainages à traiter", value: String(spons), href: "/admin/sponsorships" },
    can(user.role, "requests") && { label: "Adhésions à traiter", value: String(members), href: "/admin/memberships" },
    can(user.role, "requests") && { label: "Demandes d'aide à traiter", value: String(helps), href: "/admin/help" },
    can(user.role, "requests") && { label: "Messages non lus", value: String(msgs), href: "/admin/messages" },
    can(user.role, "settings") && { label: "Erreurs non résolues", value: String(errors), href: "/admin/errors" },
    can(user.role, "content") && { label: "Articles publiés", value: String(posts), href: "/admin/posts" },
  ].filter(Boolean) as { label: string; value: string; href: string }[];
  return (
    <>
      <Title>Tableau de bord</Title>
      {denied && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-amber-900">Vous n'avez pas accès à cette section.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}><Card className="transition hover:shadow-md"><p className="text-sm text-muted">{t.label}</p><p className="mt-1 text-3xl font-bold text-green-800">{t.value}</p></Card></Link>
        ))}
      </div>
    </>
  );
}

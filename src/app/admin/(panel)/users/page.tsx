import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { updateUser } from "@/actions/admin";
import { Card, Table, Title } from "@/components/admin/ui";
import { UserTools } from "./UserTools";

export const dynamic = "force-dynamic";
const roles = [["SUPER_ADMIN", "Super-admin (tout)"], ["EDITOR", "Éditeur (blog, actions, galerie)"], ["DONATIONS_MANAGER", "Gestionnaire dons & demandes"]];

export default async function UsersPage() {
  await requireArea("users");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <>
      <Title>Utilisateurs</Title>
      <Card className="mb-8"><UserTools mode="create" roles={roles} /></Card>
      <Table head={["Nom", "E-mail", "Rôle / accès", ""]}>
        {users.map((u) => (
          <tr key={u.id}>
            <td className="px-4 py-3 font-semibold">{u.name}</td>
            <td className="px-4 py-3">{u.email}</td>
            <td className="px-4 py-3">
              <form action={updateUser} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={u.id} />
                <select name="role" defaultValue={u.role} className="rounded-lg border border-line px-2 py-1 text-sm">{roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={u.active} /> actif</label>
                <button className="rounded-lg bg-green-700 px-2 py-1 text-xs text-white">OK</button>
              </form>
            </td>
            <td className="px-4 py-3"><UserTools mode="reset" id={u.id} roles={roles} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

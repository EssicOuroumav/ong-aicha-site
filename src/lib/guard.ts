import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export const permissions = {
  content: ["SUPER_ADMIN", "EDITOR"],
  donations: ["SUPER_ADMIN", "DONATIONS_MANAGER"],
  requests: ["SUPER_ADMIN", "DONATIONS_MANAGER"],
  settings: ["SUPER_ADMIN"],
  users: ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Area = keyof typeof permissions;

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session.user;
}

/** À appeler dans chaque page ET chaque action serveur : le contrôle d'accès ne repose jamais sur l'interface. */
export async function requireArea(area: Area) {
  const user = await requireUser();
  if (user.mustChangePw) redirect("/admin/password");
  if (!(permissions[area] as readonly Role[]).includes(user.role)) redirect("/admin?denied=1");
  return user;
}

export const can = (role: Role, area: Area) => (permissions[area] as readonly Role[]).includes(role);

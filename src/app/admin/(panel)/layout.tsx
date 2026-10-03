import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { signOut } from "@/auth";
import { can, requireUser } from "@/lib/guard";

const roleLabel = { SUPER_ADMIN: "Super-admin", EDITOR: "Éditeur", DONATIONS_MANAGER: "Gestionnaire dons" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = [
    { href: "/admin", label: "Tableau de bord", show: !user.mustChangePw },
    { href: "/admin/donations", label: "Dons", show: can(user.role, "donations") },
    { href: "/admin/sponsorships", label: "Parrainages", show: can(user.role, "requests") },
    { href: "/admin/memberships", label: "Adhésions", show: can(user.role, "requests") },
    { href: "/admin/help", label: "Demandes d'aide", show: can(user.role, "requests") },
    { href: "/admin/messages", label: "Messages", show: can(user.role, "requests") },
    { href: "/admin/posts", label: "Blog", show: can(user.role, "content") },
    { href: "/admin/activities", label: "Actions", show: can(user.role, "content") },
    { href: "/admin/media", label: "Galerie", show: can(user.role, "content") },
    { href: "/admin/texts", label: "Textes du site", show: can(user.role, "content") },
    { href: "/admin/lists", label: "Listes", show: can(user.role, "content") },
    { href: "/admin/settings", label: "Réglages", show: can(user.role, "settings") },
    { href: "/admin/users", label: "Utilisateurs", show: can(user.role, "users") },
    { href: "/admin/errors", label: "Journal d'erreurs", show: can(user.role, "settings") },
    { href: "/admin/password", label: "Mon mot de passe", show: true },
  ].filter((n) => n.show);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-green-900 text-green-50 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center gap-3 p-4">
          <span className="rounded-lg bg-cream p-1"><Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" /></span>
          <div className="leading-tight"><p className="font-bold">AICHA Admin</p><p className="text-xs text-green-100/70">{roleLabel[user.role]}</p></div>
        </div>
        <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10">{n.label}</Link>
          ))}
          <Link href="/fr" target="_blank" className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gold hover:bg-white/10">Voir le site <ArrowUpRight size={14} /></Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <button className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-start text-sm hover:bg-white/10">Se déconnecter</button>
          </form>
        </nav>
        <p className="hidden px-4 pb-4 text-xs text-green-100/60 lg:block">{user.email}</p>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}

import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { deleteResolvedErrors, setErrorResolved } from "@/actions/admin";
import { Badge, Card, Table, Title, dt } from "@/components/admin/ui";
import { SentryTest } from "@/components/admin/SentryTest";

export const dynamic = "force-dynamic";

export default async function ErrorsPage() {
  await requireArea("settings");
  const items = await db.errorLog.findMany({ orderBy: [{ resolved: "asc" }, { lastSeen: "desc" }], take: 200 });
  const open = items.filter((e) => !e.resolved).length;
  return (
    <>
      <Title action={items.some((e) => e.resolved) ? <form action={deleteResolvedErrors}><button className="btn btn-outline !py-2 text-sm text-green-800">Effacer les erreurs résolues</button></form> : undefined}>Journal d'erreurs</Title>
      <p className="mb-4 max-w-3xl text-sm text-muted">Les erreurs du site (serveur et navigateur) sont regroupées ici, sans données personnelles. {open === 0 ? "Aucune erreur non résolue." : `${open} erreur(s) non résolue(s).`} Une erreur qui revient est automatiquement rouverte. Les détails complets restent dans les logs de Vercel.</p>
      <Card className="mb-6"><h2 className="mb-2 font-bold text-green-800">Sentry (suivi d'erreurs externe)</h2><p className="mb-3 max-w-3xl text-sm text-muted">Sentry complète ce journal : alertes détaillées, historique long. Il s'active dès que la variable <code>NEXT_PUBLIC_SENTRY_DSN</code> est renseignée dans Vercel.</p><SentryTest configured={Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)} /></Card>
      <Table head={["Dernière fois", "Où", "Message", "Fois", "Statut", ""]}>
        {items.map((e) => (
          <tr key={e.id} className={e.resolved ? "opacity-60" : ""}>
            <td className="px-4 py-3 whitespace-nowrap">{dt(e.lastSeen)}</td>
            <td className="px-4 py-3 text-xs"><b>{e.source === "server" ? "Serveur" : "Navigateur"}</b><br />{e.path}</td>
            <td className="px-4 py-3 max-w-md text-xs">{e.message}{e.stack && <details className="mt-1"><summary className="cursor-pointer text-green-800">Détails</summary><pre className="mt-1 whitespace-pre-wrap text-[11px]">{e.stack}</pre></details>}</td>
            <td className="px-4 py-3">{e.count}</td>
            <td className="px-4 py-3"><Badge status={e.resolved ? "COMPLETED" : "FAILED"} /></td>
            <td className="px-4 py-3"><form action={setErrorResolved}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="resolved" value={e.resolved ? "0" : "1"} /><button className="text-xs font-semibold text-green-800 underline">{e.resolved ? "Rouvrir" : "Marquer résolue"}</button></form></td>
          </tr>
        ))}
      </Table>
      {items.length === 0 && <p className="mt-6 text-muted">Rien à signaler.</p>}
    </>
  );
}

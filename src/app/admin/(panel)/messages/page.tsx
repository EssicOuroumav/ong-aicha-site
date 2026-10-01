import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { toggleMessageRead } from "@/actions/admin";
import { Card, Title, dt } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireArea("requests");
  const items = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <Title>Messages de contact</Title>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-muted">Aucun message.</p>}
        {items.map((m) => (
          <Card key={m.id} className={m.read ? "opacity-70" : "border-l-4 border-l-gold"}>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <p><b>{m.name}</b> · <a className="text-green-700 underline" href={`mailto:${m.email}`}>{m.email}</a></p>
              <p className="text-muted">{dt(m.createdAt)}</p>
            </div>
            {m.subject && <p className="mt-1 font-semibold">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
            <form action={toggleMessageRead} className="mt-3"><input type="hidden" name="id" value={m.id} /><button className="text-sm font-semibold text-green-700 underline">{m.read ? "Marquer non lu" : "Marquer comme lu"}</button></form>
          </Card>
        ))}
      </div>
    </>
  );
}

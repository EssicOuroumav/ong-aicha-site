import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { addMedia, deleteMedia } from "@/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Title, TrilingualField } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { pick } from "@/i18n/config";

export const dynamic = "force-dynamic";
const albums = ["vague-rose", "ramadan", "cliniques", "ecole", "conventions", "autres"];

export default async function MediaAdmin() {
  await requireArea("content");
  const items = await db.mediaItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <Title>Galerie photos et vidéos</Title>
      <Card className="mb-8">
        <form action={addMedia} className="space-y-4">
          <h2 className="font-bold text-green-800">Ajouter</h2>
          <ImageField name="url" label="Photo (ou lien YouTube pour une vidéo)" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="kind" className="mb-1 block text-sm font-semibold">Type</label><select id="kind" name="kind" className="field"><option value="PHOTO">Photo</option><option value="VIDEO">Vidéo YouTube</option></select></div>
            <div><label htmlFor="album" className="mb-1 block text-sm font-semibold">Album</label><select id="album" name="album" className="field">{albums.map((a) => <option key={a}>{a}</option>)}</select></div>
          </div>
          <TrilingualField name="caption" label="Légende" />
          <button className="btn btn-primary">Ajouter à la galerie</button>
        </form>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((m) => (
          <Card key={m.id} className="!p-2">
            {m.kind === "PHOTO" ? <div className="relative aspect-square overflow-hidden rounded-lg"><Image src={m.url} alt={pick(m.caption, "fr")} fill sizes="200px" className="object-cover" /></div> : <p className="flex items-center gap-2 p-4 text-sm"><PlayCircle size={18} className="shrink-0 text-green-700" /> <span className="break-all">{m.url}</span></p>}
            <p className="mt-1 truncate px-1 text-xs text-muted">{m.album} · {pick(m.caption, "fr")}</p>
            <form action={deleteMedia} className="px-1 pb-1"><input type="hidden" name="id" value={m.id} /><ConfirmButton message="Supprimer cette photo/vidéo de la galerie ?" className="text-xs text-red-700 underline">Supprimer</ConfirmButton></form>
          </Card>
        ))}
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/guard";
import { deletePost, savePost } from "@/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Title, TrilingualField } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: PageProps<"/admin/posts/[id]">) {
  await requireArea("content");
  const { id } = await params;
  const post = id === "new" ? null : await db.post.findUnique({ where: { id } });
  if (id !== "new" && !post) notFound();
  return (
    <>
      <Title>{post ? "Modifier l'article" : "Nouvel article"}</Title>
      <form action={savePost} className="space-y-6">
        {post && <input type="hidden" name="id" value={post.id} />}
        <Card className="space-y-5">
          <TrilingualField name="title" label="Titre" value={post?.title} />
          <TrilingualField name="excerpt" label="Résumé (affiché sur les cartes)" value={post?.excerpt} rows={2} />
          <TrilingualField name="content" label="Contenu (paragraphes séparés par une ligne vide ; intertitre : ## Titre)" value={post?.content} rows={12} />
        </Card>
        <Card className="space-y-4">
          <ImageField name="coverImage" label="Image de couverture" initial={post?.coverImage} />
          <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={post?.published ?? false} className="h-5 w-5 accent-green-700" /> Publié</label>
          <div><label htmlFor="publishedAt" className="mb-1 block text-sm font-semibold">Date de publication</label><input id="publishedAt" name="publishedAt" type="date" defaultValue={(post?.publishedAt ?? new Date()).toISOString().slice(0, 10)} className="field max-w-xs" /></div>
        </Card>
        <div className="flex flex-wrap gap-3"><button className="btn btn-primary">Enregistrer</button></div>
      </form>
      {post && (
        <form action={deletePost} className="mt-6"><input type="hidden" name="id" value={post.id} /><ConfirmButton message="Supprimer définitivement cet article ?" className="text-sm text-red-700 underline">Supprimer cet article</ConfirmButton></form>
      )}
    </>
  );
}

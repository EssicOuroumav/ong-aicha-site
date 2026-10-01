import { db } from "@/lib/db";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[content]", e);
    return fallback;
  }
}

export const getActivities = () =>
  safe(() => db.activity.findMany({ where: { published: true }, orderBy: { order: "asc" } }), []);

export const getActivity = (slug: string) =>
  safe(() => db.activity.findFirst({ where: { slug, published: true } }), null);

export const getPosts = (take?: number) =>
  safe(
    () => db.post.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take }),
    [],
  );

export const getPost = (slug: string) =>
  safe(() => db.post.findFirst({ where: { slug, published: true } }), null);

export const getMedia = () =>
  safe(() => db.mediaItem.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }), []);

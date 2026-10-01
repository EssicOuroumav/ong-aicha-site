import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getActivities, getPosts } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ongaicha.org";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [activities, posts] = await Promise.all([getActivities(), getPosts()]);
  const pages = ["", "/about", "/activities", "/blog", "/gallery", "/contact", "/donate", "/sponsor", "/join", "/legal"];
  const entry = (path: string, lastModified?: Date) =>
    locales.map((l) => ({
      url: `${base}/${l}${path}`,
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${base}/${x}${path}`])) },
    }));
  return [
    ...pages.flatMap((p) => entry(p)),
    ...activities.flatMap((a) => entry(`/activities/${a.slug}`, a.updatedAt)),
    ...posts.flatMap((p) => entry(`/blog/${p.slug}`, p.updatedAt)),
  ];
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";
import { getMedia } from "@/lib/content";
import { PageHero, Section } from "@/components/ui";
import { GalleryGrid } from "@/components/GalleryGrid";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/gallery">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).gallery.title, alternates: alternatesFor(lang, "/gallery") };
}

export default async function GalleryPage({ params }: PageProps<"/[lang]/gallery">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [t, media] = await Promise.all([getDictionary(lang), getMedia()]);
  const items = media.map((m) => ({ id: m.id, kind: m.kind, url: m.url, album: m.album, caption: pick(m.caption, lang) }));
  const g = t.gallery;
  return (
    <>
      <PageHero title={g.title} lead={g.lead} />
      <Section>
        {items.length === 0 ? <p className="text-center text-muted">{t.common.noResults}</p> : (
          <GalleryGrid items={items} labels={{ all: g.all, albums: g.albums, close: g.close, previous: g.previous, next: g.next, photos: g.photos, videos: g.videos }} />
        )}
      </Section>
    </>
  );
}

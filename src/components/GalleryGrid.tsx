"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryItem = { id: string; kind: "PHOTO" | "VIDEO"; url: string; caption: string; album: string | null };
type Labels = { all: string; albums: Record<string, string>; close: string; previous: string; next: string; photos: string; videos: string };

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

export function GalleryGrid({ items, labels }: { items: GalleryItem[]; labels: Labels }) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);

  const albums = Array.from(new Set(items.filter((i) => i.kind === "PHOTO" && i.album).map((i) => i.album as string)));
  const photos = items.filter((i) => i.kind === "PHOTO" && (filter === "all" || i.album === filter));
  const videos = items.filter((i) => i.kind === "VIDEO");

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d: number) => setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close, move]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label={labels.photos}>
        {["all", ...albums].map((a) => (
          <button key={a} type="button" aria-pressed={filter === a} onClick={() => setFilter(a)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === a ? "bg-green-700 text-white" : "bg-white text-green-800 hover:bg-green-100 border border-line"}`}>
            {a === "all" ? labels.all : labels.albums[a] ?? a}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {photos.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-xl bg-green-100">
            <Image src={p.url} alt={p.caption} width={600} height={450} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="h-auto w-full transition duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {videos.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-center text-3xl font-bold text-green-800">{labels.videos}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {videos.map((v) => {
              const id = youtubeId(v.url);
              return id ? (
                <div key={v.id} className="overflow-hidden rounded-2xl bg-black shadow">
                  <div className="aspect-video">
                    <iframe className="h-full w-full" loading="lazy" title={v.caption || "Vidéo"} src={`https://www.youtube-nocookie.com/embed/${id}`} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {open !== null && photos[open] && (
        <div role="dialog" aria-modal="true" aria-label={photos[open].caption} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button type="button" aria-label={labels.close} onClick={close} className="absolute top-4 end-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X /></button>
          <button type="button" aria-label={labels.previous} onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute start-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronLeft className="rtl:rotate-180" /></button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[open].url} alt={photos[open].caption} width={1600} height={1200} sizes="100vw" className="max-h-[80vh] w-auto rounded-lg object-contain" />
            {photos[open].caption && <figcaption className="mt-3 text-center text-white/90">{photos[open].caption}</figcaption>}
          </figure>
          <button type="button" aria-label={labels.next} onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute end-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronRight className="rtl:rotate-180" /></button>
        </div>
      )}
    </div>
  );
}

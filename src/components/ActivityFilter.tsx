"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { ActivityCard } from "./Cards";

type Item = { id: string; slug: string; coverImage: string | null; title: unknown; summary: unknown; category: string | null };

export function ActivityFilter({ items, lang, filters, readMore }: { items: Item[]; lang: Locale; filters: Record<string, string>; readMore: string }) {
  const [cat, setCat] = useState("all");
  const shown = items.filter((a) => cat === "all" || a.category === cat);
  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2" role="group">
        {Object.entries(filters).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={cat === k} onClick={() => setCat(k)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${cat === k ? "bg-green-700 text-white shadow" : "glass text-green-800 hover:bg-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((a) => <ActivityCard key={a.id} a={a} lang={lang} label={readMore} heading="h2" />)}
      </div>
    </div>
  );
}

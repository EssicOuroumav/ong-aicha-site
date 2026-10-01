import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { pick, type Locale } from "@/i18n/config";
import { formatDate } from "./ui";

type Common = { slug: string; coverImage: string | null; title: unknown };

export function ActivityCard({ a, lang, label }: { a: Common & { summary: unknown }; lang: Locale; label: string }) {
  return (
    <Link href={`/${lang}/activities/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-green-100">
        {a.coverImage && <Image src={a.coverImage} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-green-800">{pick(a.title, lang)}</h3>
        <p className="mt-2 flex-1 text-muted">{pick(a.summary, lang)}</p>
        <span className="mt-4 inline-flex items-center gap-1 font-semibold text-green-700">{label} <ArrowRight size={16} className="rtl:rotate-180" /></span>
      </div>
    </Link>
  );
}

export function PostCard({ p, lang, label }: { p: Common & { excerpt: unknown; publishedAt: Date | null }; lang: Locale; label: string }) {
  return (
    <Link href={`/${lang}/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-green-100">
        {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {p.publishedAt && <time className="text-sm text-gold-dark" dateTime={p.publishedAt.toISOString()}>{formatDate(p.publishedAt, lang)}</time>}
        <h3 className="mt-1 text-xl font-bold text-green-800">{pick(p.title, lang)}</h3>
        <p className="mt-2 flex-1 text-muted">{pick(p.excerpt, lang)}</p>
        <span className="mt-4 inline-flex items-center gap-1 font-semibold text-green-700">{label} <ArrowRight size={16} className="rtl:rotate-180" /></span>
      </div>
    </Link>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, HeartHandshake, Stethoscope, type LucideIcon } from "lucide-react";
import { pick, type Locale } from "@/i18n/config";
import { formatDate } from "./ui";

type Common = { slug: string; coverImage: string | null; title: unknown };

const categoryIcon: Record<string, LucideIcon> = { health: Stethoscope, education: BookOpen, social: HeartHandshake };

/** Carte « photo plein cadre » : dégradé vert en bas, pastille d'icône dorée, titre blanc, texte révélé au survol (toujours visible sur mobile). */
export function PhotoCard({ href, image, icon: Icon, title, text, heading: Heading = "h3" }: { href: string; image: string | null; icon: LucideIcon; title: string; text: string; heading?: "h2" | "h3" }) {
  return (
    <Link href={href} className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-green-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {image && <Image src={image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#14672f] via-[#14672f]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-green-950 shadow-md"><Icon size={22} /></span>
        <Heading className="text-2xl text-white sm:text-3xl">{title}</Heading>
        <p className="mt-3 text-[15px] leading-relaxed text-white/90 transition-all duration-300 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-32 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-32 lg:group-focus-visible:opacity-100">{text}</p>
      </div>
    </Link>
  );
}

export function ActivityCard({ a, lang, heading }: { a: Common & { summary: unknown; category?: string | null }; lang: Locale; label?: string; heading?: "h2" | "h3" }) {
  const Icon = (a.category && categoryIcon[a.category]) || HeartHandshake;
  return <PhotoCard href={`/${lang}/activities/${a.slug}`} image={a.coverImage} icon={Icon} title={pick(a.title, lang)} text={pick(a.summary, lang)} heading={heading} />;
}

export function PostCard({ p, lang, label }: { p: Common & { excerpt: unknown; publishedAt: Date | null }; lang: Locale; label: string }) {
  return (
    <Link href={`/${lang}/blog/${p.slug}`} className="group glass lift flex flex-col overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-green-100">
        {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {p.publishedAt && <time className="eyebrow" dateTime={p.publishedAt.toISOString()}>{formatDate(p.publishedAt, lang)}</time>}
        <h3 className="mt-3 text-xl text-green-950">{pick(p.title, lang)}</h3>
        <p className="mt-2 flex-1 text-muted">{pick(p.excerpt, lang)}</p>
        <span className="caps-link mt-5 inline-flex items-center gap-1.5 text-green-800">{label} <ArrowRight size={14} className="rtl:rotate-180" /></span>
      </div>
    </Link>
  );
}

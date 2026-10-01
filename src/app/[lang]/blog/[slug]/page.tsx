import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPost, getPosts } from "@/lib/content";
import { PageHero, RichText, Section, formatDate } from "@/components/ui";
import { PostCard } from "@/components/Cards";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: pick(p.title, lang),
    description: pick(p.excerpt, lang),
    openGraph: { type: "article", images: p.coverImage ? [p.coverImage] : undefined, publishedTime: p.publishedAt?.toISOString() },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [t, post, all] = await Promise.all([getDictionary(lang), getPost(slug), getPosts(4)]);
  if (!post) notFound();
  const others = all.filter((x) => x.id !== post.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pick(post.title, lang),
    datePublished: post.publishedAt?.toISOString(),
    image: post.coverImage ? [post.coverImage] : undefined,
    author: { "@type": "Organization", name: "ONG AICHA" },
    inLanguage: lang,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title={pick(post.title, lang)} eyebrow={post.publishedAt ? `${t.common.publishedOn} ${formatDate(post.publishedAt, lang)}` : undefined} />
      <Section>
        <article className="mx-auto max-w-3xl">
          {post.coverImage && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
              <Image src={post.coverImage} alt={pick(post.title, lang)} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            </div>
          )}
          <RichText text={pick(post.content, lang)} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/${lang}/blog`} className="btn btn-outline text-green-700">{t.common.backToList}</Link>
            <Link href={`/${lang}/donate`} className="btn btn-gold">{t.nav.donate}</Link>
          </div>
        </article>
      </Section>
      {others.length > 0 && (
        <section className="bg-green-50">
          <Section>
            <h2 className="mb-8 text-2xl font-bold text-green-800">{t.blog.latest}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => <PostCard key={o.id} p={o} lang={lang} label={t.common.readMore} />)}
            </div>
          </Section>
        </section>
      )}
    </>
  );
}

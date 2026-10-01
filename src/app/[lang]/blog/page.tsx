import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPosts } from "@/lib/content";
import { PageHero, Section } from "@/components/ui";
import { PostCard } from "@/components/Cards";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: (await getDictionary(lang)).blog.title };
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const posts = await getPosts();
  return (
    <>
      <PageHero title={t.blog.title} lead={t.blog.lead} />
      <Section>
        {posts.length === 0 ? <p className="text-center text-muted">{t.blog.empty}</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} p={p} lang={lang} label={t.common.readMore} />)}
          </div>
        )}
      </Section>
    </>
  );
}

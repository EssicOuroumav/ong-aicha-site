import { PageHero, Section } from "@/components/ui";

type Doc = { title: string; updated: string; intro: string; sections: { title: string; body: string[] }[] };

export function LegalDoc({ doc }: { doc: Doc }) {
  return (
    <>
      <PageHero title={doc.title} lead={doc.updated} />
      <Section>
        <article className="mx-auto max-w-3xl">
          <p className="mb-10 text-lg leading-relaxed text-ink/90">{doc.intro}</p>
          <ol className="space-y-10">
            {doc.sections.map((s, i) => (
              <li key={s.title}>
                <h2 className="text-2xl text-green-950"><span className="me-3 text-green-700">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                <div className="prose-aicha mt-3 text-lg">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
              </li>
            ))}
          </ol>
        </article>
      </Section>
    </>
  );
}

import type { ReactNode } from "react";

export function PageHero({ title, lead, eyebrow }: { title: string; lead?: string; eyebrow?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 18% 25%, rgba(127,220,164,.55) 0, transparent 38%), radial-gradient(circle at 88% 75%, rgba(255,255,255,.22) 0, transparent 42%)" }} />
      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>}
        <h1 className="reveal text-4xl font-bold sm:text-5xl">{title}</h1>
        {lead && <p className="reveal mx-auto mt-5 max-w-2xl text-lg text-green-50/90">{lead}</p>}
      </div>
    </section>
  );
}

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ title, lead, center = true }: { title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      <h2 className="text-3xl font-bold text-green-800 sm:text-4xl">{title}</h2>
      <div className={`mt-3 h-1 w-16 rounded bg-gold ${center ? "mx-auto" : ""}`} />
      {lead && <p className={`mt-4 max-w-2xl text-muted ${center ? "mx-auto" : ""}`}>{lead}</p>}
    </div>
  );
}

/** Rend un texte brut : paragraphes séparés par une ligne vide, intertitres "## " */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose-aicha text-lg text-ink/90">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i}>{b.slice(3)}</h2>
        ) : b.split("\n").every((l) => l.trim().startsWith("- ")) ? (
          <ul key={i} className="mb-5 list-disc space-y-1 ps-6">
            {b.split("\n").map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}
          </ul>
        ) : (
          <p key={i}>{b}</p>
        ),
      )}
    </div>
  );
}

export function formatDate(date: Date | string, lang: string) {
  const locale = lang === "ar" ? "ar-u-nu-latn" : lang === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

import type { ReactNode } from "react";

export function PageHero({ title, lead, eyebrow }: { title: string; lead?: string; eyebrow?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 18% 25%, rgba(127,220,164,.55) 0, transparent 38%), radial-gradient(circle at 88% 75%, rgba(255,255,255,.22) 0, transparent 42%)" }} />
      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
        {eyebrow && <p className="eyebrow eyebrow-light mb-4">{eyebrow}</p>}
        <h1 className="reveal text-4xl sm:text-6xl">{title}</h1>
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

/** Titre éditorial : surtitre à filet, titre en deux tons (début foncé, fin en italique clair), introduction à droite. */
export function SectionTitle({ title, lead, eyebrow, center = false, light = false }: { title: string; lead?: string; eyebrow?: string; center?: boolean; light?: boolean }) {
  const words = title.split(" ");
  const n = words.length >= 4 ? 2 : words.length >= 2 ? 1 : 0;
  const head = n ? words.slice(0, -n).join(" ") : title;
  const tail = n ? words.slice(-n).join(" ") : "";
  return (
    <div className={`mb-10 sm:mb-12 ${center ? "text-center" : "grid items-end gap-6 lg:grid-cols-2"}`}>
      <div>
        {eyebrow && <p className={`eyebrow mb-4 ${light ? "eyebrow-light" : ""}`}>{eyebrow}</p>}
        <h2 className={`text-4xl sm:text-5xl ${light ? "text-white" : "text-green-950"}`}>
          {head} {tail && <span className={`accent-italic ${light ? "!text-green-100" : ""}`}>{tail}</span>}
        </h2>
      </div>
      {lead && <p className={`max-w-xl text-lg ${center ? "mx-auto mt-4" : "lg:justify-self-end"} ${light ? "text-green-50/85" : "text-muted"}`}>{lead}</p>}
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

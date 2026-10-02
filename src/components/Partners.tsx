import { Handshake } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { Section, SectionTitle } from "./ui";

export function Partners({ t }: { t: Dictionary }) {
  return (
    <Section>
      <SectionTitle title={t.partners.title} lead={t.partners.lead} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.partners.items.map((name) => (
          <li key={name} className="glass lift flex items-center gap-4 rounded-2xl p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white"><Handshake size={22} /></span>
            <span className="font-semibold text-green-900">{name}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import Image from "next/image";
import { Handshake } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { Section, SectionTitle } from "./ui";

export function Partners({ t }: { t: Dictionary }) {
  return (
    <Section>
      <SectionTitle eyebrow={t.home.eyebrows.partners} title={t.partners.title} lead={t.partners.lead} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {t.partners.items.map((p) => (
          <li key={p.name} className="glass lift flex flex-col overflow-hidden rounded-3xl">
            <div className="relative flex h-36 items-center justify-center bg-white p-4">
              {p.logo ? <Image src={p.logo} alt="" fill sizes="(min-width:1024px) 20vw, 50vw" className="object-contain p-4" /> : <Handshake size={44} className="text-green-700" />}
            </div>
            <p className="flex-1 border-t border-line p-4 text-center text-[13px] font-semibold leading-snug text-green-950">{p.name}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

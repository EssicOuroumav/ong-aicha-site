import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettings } from "@/lib/settings";

export function Footer({ lang, t, settings }: { lang: Locale; t: Dictionary; settings: SiteSettings }) {
  const links = [
    { href: "/about", label: t.nav.about },
    { href: "/activities", label: t.nav.activities },
    { href: "/blog", label: t.nav.blog },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/donate", label: t.nav.donate },
    { href: "/sponsor", label: t.nav.sponsor },
    { href: "/join", label: t.nav.join },
    { href: "/contact", label: t.nav.contact },
    { href: "/help", label: t.footer.help },
  ];
  return (
    <footer className="mt-20 bg-gradient-to-b from-green-800 to-green-900 text-green-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-cream p-1.5"><Image src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" /></span>
            <span className="font-display text-2xl font-bold">AICHA</span>
          </div>
          <p className="mt-4 max-w-sm text-green-100/90">{t.footer.about}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-gold">{t.footer.links}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={`/${lang}${l.href}`} className="hover:text-gold transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-gold">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-green-100/90">
            <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0" /><span dir="ltr">{settings.phone}</span></li>
            <li className="flex gap-3"><Mail size={18} className="mt-1 shrink-0" /><a href={`mailto:${settings.email}`} className="hover:text-gold">{settings.email}</a></li>
            <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0" /><span>{settings.address}</span></li>
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Facebook</a>}
            {settings.youtube && <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-gold">YouTube</a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-green-100/70">
        © {new Date().getFullYear()} ONG AICHA · {t.footer.rights} ·{" "}
        <Link href={`/${lang}/legal`} className="underline hover:text-gold">{t.footer.legal}</Link> ·{" "}
        <Link href="/admin" className="underline hover:text-gold">{t.footer.admin}</Link>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rest = pathname.replace(new RegExp(`^/${lang}`), "") || "";

  const links = [
    { href: "", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/activities", label: t.nav.activities },
    { href: "/blog", label: t.nav.blog },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/contact", label: t.nav.contact },
  ];
  const isActive = (href: string) => (href === "" ? rest === "" : rest.startsWith(href));

  return (
    <header className="glass-header sticky top-0 z-40 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0" aria-label={t.meta.siteName}>
          <span className="rounded-2xl bg-white/95 p-1 shadow-md"><Image src="/logo.png" alt="" width={56} height={56} priority className="h-12 w-12 object-contain" /></span>
          <span className="hidden sm:block leading-tight">
            <span className="block font-display text-lg font-bold text-white">AICHA</span>
            <span className="block text-xs text-green-100/90">{t.meta.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/${lang}${l.href}`}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.href) ? "bg-white text-green-800 shadow" : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch lang={lang} rest={rest} label={t.nav.language} />
          <Link href={`/${lang}/donate`} className="btn btn-white hidden sm:inline-flex !py-2 text-sm">
            {t.nav.donate}
          </Link>
          <button
            type="button"
            className="lg:hidden rounded-full p-2 hover:bg-white/15"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-white/15 px-4 pb-4">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={`/${lang}${l.href}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-medium hover:bg-white/15"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-2 pt-2">
              <Link href={`/${lang}/donate`} onClick={() => setOpen(false)} className="btn btn-white flex-1">{t.nav.donate}</Link>
              <Link href={`/${lang}/sponsor`} onClick={() => setOpen(false)} className="btn glass-green flex-1">{t.nav.sponsor}</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function LangSwitch({ lang, rest, label }: { lang: Locale; rest: string; label: string }) {
  return (
    <ul className="flex items-center rounded-full border border-white/30 bg-white/10 p-0.5" aria-label={label}>
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={`/${l}${rest}`}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            title={localeNames[l]}
            className={`block rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
              l === lang ? "bg-white text-green-800" : "text-white/85 hover:text-white"
            }`}
          >
            {l}
          </Link>
        </li>
      ))}
    </ul>
  );
}

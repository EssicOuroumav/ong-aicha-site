"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-white px-2 pb-2 pt-2 sm:px-4">
      <div className="glass-header mx-auto max-w-7xl rounded-2xl text-white">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link href={`/${lang}`} className="flex shrink-0 items-center gap-3" aria-label={`AICHA ${t.meta.tagline}`}>
            <span className="rounded-xl bg-white p-1 shadow-md"><Image src="/logo.png" alt="" width={56} height={56} priority className="h-10 w-10 object-contain" /></span>
            <span className="hidden leading-tight xl:block">
              <span className="block font-display text-lg font-extrabold uppercase tracking-[0.16em]">AICHA</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/75">{t.meta.tagline}</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={`/${lang}${l.href}`}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.1em] ${
                  isActive(l.href) ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} rest={rest} label={t.nav.language} />
            <Link href={`/${lang}/donate`} className="btn btn-white btn-caps hidden whitespace-nowrap !rounded-xl !py-2.5 md:inline-flex">
              {t.nav.donate} <ArrowUpRight size={16} />
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/15 lg:hidden"
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
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-white/15 px-4 pb-4 lg:hidden">
            <ul className="flex flex-col py-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={`/${lang}${l.href}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-[0.1em] hover:bg-white/15">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="flex gap-2 pt-2">
                <Link href={`/${lang}/donate`} onClick={() => setOpen(false)} className="btn btn-white btn-caps flex-1">{t.nav.donate}</Link>
                <Link href={`/${lang}/sponsor`} onClick={() => setOpen(false)} className="btn glass-green btn-caps flex-1">{t.nav.sponsor}</Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

function LangSwitch({ lang, rest, label }: { lang: Locale; rest: string; label: string }) {
  return (
    <ul className="flex items-center rounded-lg border border-white/30 bg-white/10 p-0.5" aria-label={label}>
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={`/${l}${rest}`}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            title={localeNames[l]}
            className={`block rounded-md px-2.5 py-1 text-xs font-bold uppercase ${l === lang ? "bg-white text-green-800" : "text-white/85 hover:text-white"}`}
          >
            {l}
          </Link>
        </li>
      ))}
    </ul>
  );
}

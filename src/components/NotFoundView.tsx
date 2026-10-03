"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Compass, HeartHandshake, Mail } from "lucide-react";

const texts = {
  fr: { title: "Page introuvable", text: "La page que vous cherchez n'existe pas ou a été déplacée. Voici où continuer :", home: "Retour à l'accueil", donate: "Faire un don", contact: "Nous contacter", actions: "Nos actions" },
  en: { title: "Page not found", text: "The page you are looking for does not exist or has moved. Here is where to go next:", home: "Back to home", donate: "Donate", contact: "Contact us", actions: "Our work" },
  ar: { title: "الصفحة غير موجودة", text: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك المتابعة من هنا:", home: "العودة إلى الرئيسية", donate: "تبرّع الآن", contact: "اتصل بنا", actions: "أعمالنا" },
} as const;

export function NotFoundView() {
  const pathname = usePathname();
  const lang = (["fr", "en", "ar"] as const).find((l) => pathname.startsWith(`/${l}`)) ?? "fr";
  const t = texts[lang];
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
      <p className="font-display text-8xl font-extrabold text-green-700 sm:text-9xl" aria-hidden>404</p>
      <h1 className="mt-4 text-4xl text-green-950 sm:text-5xl">{t.title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t.text}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={`/${lang}`} className="btn btn-primary btn-caps">{t.home} <ArrowUpRight size={16} /></Link>
        <Link href={`/${lang}/activities`} className="btn btn-outline btn-caps text-green-800"><Compass size={16} /> {t.actions}</Link>
        <Link href={`/${lang}/donate`} className="btn btn-outline btn-caps text-green-800"><HeartHandshake size={16} /> {t.donate}</Link>
        <Link href={`/${lang}/contact`} className="btn btn-outline btn-caps text-green-800"><Mail size={16} /> {t.contact}</Link>
      </div>
    </div>
  );
}

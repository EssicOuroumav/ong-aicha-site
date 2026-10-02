"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const texts = {
  fr: { title: "Une erreur est survenue", text: "Désolé, ce contenu n'a pas pu s'afficher. L'équipe technique en est informée.", retry: "Réessayer", home: "Accueil" },
  en: { title: "Something went wrong", text: "Sorry, this content could not be displayed. The technical team has been notified.", retry: "Try again", home: "Home" },
  ar: { title: "حدث خطأ", text: "عذرًا، تعذّر عرض هذا المحتوى. تم إبلاغ الفريق التقني.", retry: "إعادة المحاولة", home: "الرئيسية" },
} as const;

export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const lang = (["fr", "en", "ar"] as const).find((l) => pathname.startsWith(`/${l}`)) ?? "fr";
  const t = texts[lang];
  useEffect(() => {
    fetch("/api/log-error", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: error.message, digest: error.digest, path: pathname }) }).catch(() => {});
  }, [error, pathname]);
  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-4xl text-green-950">{t.title}</h1>
      <p className="mt-4 text-muted">{t.text}</p>
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={reset} className="btn btn-primary btn-caps">{t.retry}</button>
        <a href={`/${lang}`} className="btn btn-outline btn-caps text-green-800">{t.home}</a>
      </div>
    </div>
  );
}

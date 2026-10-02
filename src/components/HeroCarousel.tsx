"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type Slide = { id: string; image: string; eyebrow: string; title: string; text: string; primary: { href: string; label: string }; secondary?: { href: string; label: string } };
type Labels = { previous: string; next: string; slide: string; pause: string; play: string };

const DELAY = 7000;

export function HeroCarousel({ slides, labels }: { slides: Slide[]; labels: Labels }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = slides.length;

  useEffect(() => { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const running = playing && !hover && !reduced && n > 1;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(id);
  }, [i, running, go]);

  // On ne charge que la diapositive affichée, la suivante et la précédente (pour un fondu enchaîné sans à-coup)
  const wanted = (idx: number) => idx === i || idx === (i + 1) % n || idx === (i - 1 + n) % n;

  return (
    <section
      aria-roledescription="carousel"
      className="relative isolate flex min-h-[84vh] items-end overflow-hidden text-white"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {slides.map((s, idx) => wanted(idx) && (
          <Image key={s.id} src={s.image} alt="" fill priority={idx === 0} sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/45 to-green-950/20" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-36 sm:px-6 sm:pb-14">
        <div className="glass-green max-w-3xl rounded-3xl p-6 sm:p-10" aria-live={running ? "off" : "polite"}>
          {slides.map((s, idx) => (
            <div key={s.id} role="group" aria-roledescription="slide" aria-label={`${labels.slide} ${idx + 1} / ${n}`} hidden={idx !== i} className={idx === i ? "reveal" : ""}>
              <p className="eyebrow eyebrow-light">{s.eyebrow}</p>
              <h1 className="mt-4 text-4xl sm:text-6xl lg:text-[4.25rem]">{s.title}</h1>
              <p className="mt-5 max-w-2xl text-lg text-green-50/95 sm:text-xl">{s.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={s.primary.href} className="btn btn-white btn-caps">{s.primary.label} <ArrowUpRight size={16} /></Link>
                {s.secondary && <Link href={s.secondary.href} className="btn btn-outline btn-caps text-white hover:bg-white hover:text-green-800">{s.secondary.label}</Link>}
              </div>
            </div>
          ))}
        </div>

        {n > 1 && (
          <div className="mt-6 flex items-center gap-4">
            <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className="glass-green flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/20"><ChevronLeft className="rtl:rotate-180" /></button>
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className="glass-green flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/20"><ChevronRight className="rtl:rotate-180" /></button>
            <ol className="flex flex-1 items-center gap-2" aria-label={labels.slide}>
              {slides.map((s, idx) => (
                <li key={s.id} className="flex-1 max-w-16">
                  <button type="button" onClick={() => setI(idx)} aria-label={`${labels.slide} ${idx + 1}`} aria-current={idx === i ? "true" : undefined} className="group block w-full py-2">
                    <span className="block h-1 overflow-hidden rounded-full bg-white/30">
                      <span key={idx === i ? `${i}-${running}` : "x"} className={`block h-full rounded-full bg-gold ${idx === i ? (running ? "hero-progress" : "w-full") : "w-0"}`} />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => setPlaying((v) => !v)} aria-label={playing ? labels.pause : labels.play} className="glass-green flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/20">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

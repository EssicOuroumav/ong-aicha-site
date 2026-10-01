"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroSlider({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % images.length), 6000);
    return () => clearInterval(id);
  }, [images.length]);
  return (
    <div aria-hidden className="absolute inset-0">
      {images.map((src, idx) => (
        <Image key={src} src={src} alt="" fill priority={idx === 0} sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-900/60 to-green-900/30" />
    </div>
  );
}

import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/ratelimit";
import { pick, isLocale, dirOf } from "@/i18n/config";
import { addPeriod } from "@/lib/sponsorship";
import { escapeHtml } from "@/lib/email";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

describe("rateLimit", () => {
  it("bloque au-delà du maximum puis laisse passer les autres clés", () => {
    const k = "t-" + Math.random();
    expect([1, 2, 3].map(() => rateLimit(k, 3, 1000))).toEqual([true, true, true]);
    expect(rateLimit(k, 3, 1000)).toBe(false);
    expect(rateLimit(k + "x", 3, 1000)).toBe(true);
  });
});

describe("i18n", () => {
  it("choisit la langue demandée avec repli sur le français", () => {
    expect(pick({ fr: "Bonjour", en: "Hello" }, "en")).toBe("Hello");
    expect(pick({ fr: "Bonjour" }, "ar")).toBe("Bonjour");
    expect(pick(null, "fr")).toBe("");
  });
  it("reconnaît les langues et la direction", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(dirOf("ar")).toBe("rtl");
    expect(dirOf("fr")).toBe("ltr");
  });
  const keys = (o: unknown, p = ""): string[] =>
    o && typeof o === "object"
      ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`))
      : [p];
  it("en.json et ar.json ont exactement les mêmes clés que fr.json", () => {
    expect(keys(en)).toEqual(keys(fr));
    expect(keys(ar)).toEqual(keys(fr));
  });
});

describe("parrainage", () => {
  it("calcule l'échéance suivante", () => {
    const d = new Date("2026-01-15T00:00:00Z");
    expect(addPeriod(d, "MONTHLY").getUTCMonth()).toBe(1);
    expect(addPeriod(d, "QUARTERLY").getUTCMonth()).toBe(3);
    expect(addPeriod(d, "YEARLY").getUTCFullYear()).toBe(2027);
  });
});

describe("sécurité e-mail", () => {
  it("échappe le HTML", () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
  });
});

describe("contenu", () => {
  it("aucun budget FCFA dans les données importées", async () => {
    const { readFileSync } = await import("node:fs");
    for (const f of ["activities", "posts", "gallery"]) {
      const txt = readFileSync(`prisma/seed-data/${f}.json`, "utf8");
      expect(txt).not.toMatch(/\d[\d\s.]*\s?(FCFA|F CFA|frs)/i);
      expect(txt).not.toMatch(/budget/i);
    }
  });
});

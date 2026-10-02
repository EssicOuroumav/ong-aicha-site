import { describe, expect, it } from "vitest";
import { applyList, flatten, parsePath, setText, type Dict } from "@/lib/overrides";

const base = (): Dict => ({
  nav: { home: "Accueil" },
  home: { pillars: [{ title: "Soutenir" }, { title: "Secourir" }], stats: [{ value: "1", label: "a" }] },
  partners: { items: [{ name: "A", logo: "/a.png" }, { name: "B", logo: "" }] },
  donate: { faq: [{ q: "Q1", a: "R1" }] },
  about: { timeline: [{ year: "2019", title: "T", text: "X" }] },
});

describe("surcharges de textes", () => {
  it("analyse les chemins avec indices", () => {
    expect(parsePath("home.pillars[2].title")).toEqual(["home", "pillars", 1, "title"]);
    expect(parsePath("a..b")).toEqual([]);
  });
  it("remplace un texte existant, y compris dans un tableau", () => {
    const d = base();
    expect(setText(d, "nav.home", "Bienvenue")).toBe(true);
    expect(setText(d, "home.pillars[2].title", "Aider")).toBe(true);
    expect((d.nav as { home: string }).home).toBe("Bienvenue");
    expect((d.home as { pillars: { title: string }[] }).pillars[1].title).toBe("Aider");
  });
  it("refuse de créer une clé inconnue ou d'écraser un objet", () => {
    const d = base();
    expect(setText(d, "nav.inconnu", "x")).toBe(false);
    expect(setText(d, "nope.deep.key", "x")).toBe(false);
    expect(setText(d, "home", "x")).toBe(false);
    expect(setText(d, "__proto__.polluted", "x")).toBe(false);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it("aplatit le dictionnaire", () => {
    expect(flatten(base())["home.pillars[1].title"]).toBe("Soutenir");
    expect(Object.keys(flatten(base())).length).toBe(14);
  });
  it("applique les listes avec repli sur le français", () => {
    const d = base();
    applyList(d, "partners", [{ name: { fr: "Org FR", en: "", ar: "منظمة" }, logo: "/x.png" }, { name: { fr: "", en: "", ar: "" }, logo: "" }], "ar");
    applyList(d, "faq", [{ q: { fr: "Question", en: "", ar: "" }, a: { fr: "Réponse", en: "Answer", ar: "" } }], "en");
    applyList(d, "stats", [{ value: 710, label: { fr: "familles", en: "", ar: "" } }], "fr");
    expect((d.partners as { items: { name: string; logo: string }[] }).items).toEqual([{ name: "منظمة", logo: "/x.png" }]);
    expect((d.donate as { faq: { q: string; a: string }[] }).faq).toEqual([{ q: "Question", a: "Answer" }]);
    expect((d.home as { stats: { value: string }[] }).stats[0].value).toBe("710");
  });
});

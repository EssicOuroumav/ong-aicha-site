import { describe, expect, it } from "vitest";
import { limitKey, memoryLimit } from "@/lib/ratelimit";
import { donationWindow, MAX_AGE_DAYS, MIN_AGE_MIN } from "@/lib/donationSync";
import { verifyBackup } from "@/lib/backup";

describe("limiteur de débit (repli local)", () => {
  it("autorise jusqu'à la limite puis refuse, puis ré-autorise après la fenêtre", () => {
    const t = 1_000_000;
    expect([1, 2, 3].map(() => memoryLimit("k1", 3, 1000, t))).toEqual([true, true, true]);
    expect(memoryLimit("k1", 3, 1000, t + 10)).toBe(false);
    expect(memoryLimit("k1", 3, 1000, t + 1500)).toBe(true);
  });
  it("les clés sont indépendantes", () => {
    expect(memoryLimit("a", 1, 1000, 5)).toBe(true);
    expect(memoryLimit("b", 1, 1000, 5)).toBe(true);
  });
  it("une clé saisie par le visiteur devient une empreinte de taille fixe", () => {
    const k = limitKey(`login-user:${"x".repeat(5000)}@exemple.org`);
    expect(k.length).toBeLessThan(70);
    expect(k.startsWith("login-user:")).toBe(true);
    expect(limitKey("login:1.2.3.4")).toBe(limitKey("login:1.2.3.4"));
    expect(limitKey("login:1.2.3.4")).not.toBe(limitKey("login:1.2.3.5"));
  });
});

describe("rattrapage des dons en attente", () => {
  it("fenêtre : plus de 30 minutes, moins de 30 jours", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    const w = donationWindow(now);
    expect(now.getTime() - w.olderThan.getTime()).toBe(MIN_AGE_MIN * 60_000);
    expect(now.getTime() - w.newerThan.getTime()).toBe(MAX_AGE_DAYS * 86_400_000);
  });
});

describe("contrôle d'une sauvegarde", () => {
  const ok = { meta: { format: "aicha-backup-v1" }, counts: { posts: 1, users: 0 }, data: { posts: [{ id: "a" }], users: [] } };
  it("accepte une sauvegarde cohérente", () => expect(verifyBackup(ok)).toEqual([]));
  it("détecte un total faux, une section absente, un format inconnu et un mot de passe", () => {
    expect(verifyBackup({ ...ok, counts: { posts: 2, users: 0 } })).toHaveLength(1);
    expect(verifyBackup({ ...ok, data: { posts: [{ id: "a" }] } })).toHaveLength(1);
    expect(verifyBackup({ ...ok, meta: { format: "autre" } })).toContain("format inconnu");
    expect(verifyBackup({ ...ok, data: { posts: [{ passwordHash: "x" }], users: [] } })).toContain("contient des mots de passe hachés");
    expect(verifyBackup(null)).toEqual(["fichier illisible"]);
  });
});

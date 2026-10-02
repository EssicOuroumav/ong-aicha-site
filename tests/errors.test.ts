import { describe, expect, it } from "vitest";
import { fingerprint, sanitizeMessage, sanitizePath } from "@/lib/errorsanitize";
import { stripSecrets } from "@/lib/backup";

describe("journal d'erreurs : pas de données personnelles", () => {
  it("masque e-mails, numéros, URL de base et secrets", () => {
    const m = sanitizeMessage("Échec pour awa@example.com tel +225 07 08 99 96 26 sur postgresql://user:pw@host/db avec sk_live_abcdefghijklmnop");
    expect(m).not.toMatch(/awa@example\.com|0708|pw@host|abcdefghijklmnop/);
    expect(m).toContain("[e-mail]");
    expect(m).toContain("[numéro]");
  });
  it("nettoie les chemins (paramètres et identifiants)", () => {
    expect(sanitizePath("/fr/donate/result?ref=AICHA-123&email=a@b.c")).toBe("/fr/donate/result");
    expect(sanitizePath("/admin/posts/cmupforb60001q79kcqbcf4pu")).toBe("/admin/posts/[id]");
  });
  it("regroupe les erreurs identiques", () => {
    expect(fingerprint("server", "/fr", "x")).toBe(fingerprint("server", "/fr", "x"));
    expect(fingerprint("server", "/fr", "x")).not.toBe(fingerprint("client", "/fr", "x"));
  });
});

describe("sauvegarde", () => {
  it("ne contient jamais de mot de passe", () => {
    const row = stripSecrets({ id: "1", email: "a@b.c", passwordHash: "$2a$12$secret" });
    expect(JSON.stringify(row)).not.toContain("secret");
    expect("passwordHash" in row).toBe(false);
  });
});

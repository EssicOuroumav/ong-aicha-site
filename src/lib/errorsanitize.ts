import { createHash } from "node:crypto";

/** Retire les données personnelles probables d'un message d'erreur avant stockage. */
export function sanitizeMessage(input: string, max = 500): string {
  return input
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[e-mail]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[numéro]")
    .replace(/(postgres(?:ql)?:\/\/)[^\s'"]+/gi, "$1[masqué]")
    .replace(/\b(?:sk|pk|rk)_[A-Za-z]+_[A-Za-z0-9]{8,}\b/g, "[secret]")
    .replace(/\b(?:key|token|secret)[_-]?[A-Za-z0-9]{12,}\b/gi, "[secret]")
    .slice(0, max);
}

/** Chemin sans paramètres (pas de données dans l'URL) ni identifiants longs. */
export function sanitizePath(path: string): string {
  return path.split("?")[0].split("#")[0].replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$)/g, "/[id]").slice(0, 200);
}

export function fingerprint(source: string, path: string, message: string): string {
  return createHash("sha1").update(`${source}|${path}|${message}`).digest("hex").slice(0, 32);
}

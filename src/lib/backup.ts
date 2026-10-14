import type { PrismaClient } from "@/generated/prisma/client";

/** Retire les secrets avant tout export (mots de passe hachés). */
export function stripSecrets<T extends Record<string, unknown>>(row: T): Omit<T, "passwordHash"> {
  const { passwordHash: _omit, ...rest } = row as T & { passwordHash?: unknown };
  void _omit;
  return rest;
}

/** Instantané complet des données du site (JSON), sans mots de passe. */
export async function buildBackup(db: PrismaClient) {
  const [users, posts, activities, media, donations, sponsorships, memberships, messages, helps, settings, texts, lists] = await Promise.all([
    db.user.findMany(), db.post.findMany(), db.activity.findMany(), db.mediaItem.findMany(), db.donation.findMany(),
    db.sponsorship.findMany(), db.membership.findMany(), db.contactMessage.findMany(), db.helpRequest.findMany(),
    db.setting.findMany(), db.textOverride.findMany(), db.contentList.findMany(),
  ]);
  const data = {
    users: users.map(stripSecrets), posts, activities, media, donations, sponsorships, memberships, messages, helpRequests: helps,
    settings, textOverrides: texts, contentLists: lists,
  };
  return {
    meta: { createdAt: new Date().toISOString(), format: "aicha-backup-v1", note: "Mots de passe exclus. Contient des données personnelles : à conserver en lieu sûr." },
    counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
    data,
  };
}

/** Contrôle d'une sauvegarde déjà écrite : format reconnu, totaux cohérents avec le contenu, aucun mot de passe. Renvoie la liste des anomalies. */
export function verifyBackup(raw: unknown): string[] {
  const problems: string[] = [];
  const b = raw as { meta?: { format?: string }; counts?: Record<string, number>; data?: Record<string, unknown[]> } | null;
  if (!b || typeof b !== "object") return ["fichier illisible"];
  if (b.meta?.format !== "aicha-backup-v1") problems.push("format inconnu");
  if (!b.data || !b.counts) return [...problems, "contenu absent"];
  for (const [k, n] of Object.entries(b.counts)) {
    const rows = b.data[k];
    if (!Array.isArray(rows)) problems.push(`${k} : section absente`);
    else if (rows.length !== n) problems.push(`${k} : ${rows.length} ligne(s) pour ${n} annoncée(s)`);
  }
  if (JSON.stringify(b.data).includes('"passwordHash"')) problems.push("contient des mots de passe hachés");
  return problems;
}

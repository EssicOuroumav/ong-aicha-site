import { db } from "@/lib/db";

export type SiteSettings = {
  phone: string;
  donationPhone: string;
  email: string;
  address: string;
  facebook: string;
  youtube: string;
  instagram: string;
};

export const defaultSettings: SiteSettings = {
  phone: "(+225) 07 08 99 96 26",
  donationPhone: "(+225) 07 08 20 46 77",
  email: "ongaicha2022@gmail.com",
  address: "Port-Bouët Abattoir, Abidjan, Côte d'Ivoire",
  facebook: "https://www.facebook.com/AssociationIslamiqueCaritativeHumanitaireActive/",
  youtube: "https://www.youtube.com/@ONGAICHA",
  instagram: "",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.setting.findMany();
    const out: Record<string, unknown> = { ...defaultSettings };
    for (const r of rows) out[r.key] = r.value;
    return out as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

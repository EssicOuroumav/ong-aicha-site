// Contrôle avant ouverture : node scripts/check-launch.mjs https://ong-aicha-site.vercel.app
const base = (process.argv[2] ?? "https://ong-aicha-site.vercel.app").replace(/\/$/, "");
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? "✔" : "✘"} ${msg}`); if (!c) fails++; };
const get = (p, o) => fetch(base + p, { redirect: "manual", ...o });

for (const l of ["fr", "en", "ar"]) {
  for (const p of ["", "/about", "/activities", "/blog", "/gallery", "/contact", "/donate", "/sponsor", "/join", "/help", "/legal", "/privacy", "/terms"]) {
    const r = await get(`/${l}${p}`);
    ok(r.status === 200, `/${l}${p} → ${r.status}`);
  }
}
for (const p of ["/robots.txt", "/sitemap.xml", "/logo.png", "/images/og.jpg", "/favicon.ico"]) ok((await get(p)).status === 200, `${p} accessible`);
ok((await get("/api/dev-pay?ref=x")).status === 404, "simulateur de paiement fermé");
ok((await get("/api/cron/reminders")).status === 401, "cron des rappels protégé");
ok([401, 503].includes((await get("/api/cron/donations")).status), "cron de rattrapage des dons protégé");
ok((await get("/api/admin/upload", { method: "POST" })).status === 403, "upload protégé");
ok((await get("/admin/donations/export")).status === 403, "export CSV protégé");
ok([307, 308].includes((await get("/admin/donations")).status), "admin redirige sans session");
const h = (await get("/fr")).headers;
for (const k of ["strict-transport-security", "x-content-type-options", "x-frame-options", "content-security-policy"]) ok(h.has(k), `en-tête ${k}`);
const d = await (await get("/fr/donate")).text();
ok(!d.includes("PAYDUNYA_"), "aucune clé exposée dans la page de don");
console.log(fails ? `\n${fails} contrôle(s) en échec` : "\nTout est bon");
process.exit(fails ? 1 : 0);

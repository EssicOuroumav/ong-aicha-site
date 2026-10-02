# Site ONG AICHA

Next.js 16 (App Router) · TypeScript · Tailwind 4 · Prisma 7 + Postgres (Neon) · Auth.js · PayDunya · Resend · Vercel Blob.
Langues : français, anglais, arabe (RTL) via `/fr`, `/en`, `/ar`.

## Démarrer en local
```bash
vercel env pull .env.local     # variables du projet Vercel
npm install
npm run db:deploy:test         # base de TEST (jamais la production)
npm run db:seed:test           # compte admin + contenu initial
npm run dev
```

## Variables d'environnement
| Variable | Rôle |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Postgres de **production** (utilisée seulement en production Vercel) |
| `DEV_DATABASE_URL`, `DEV_DATABASE_URL_UNPOOLED` | Postgres de **test** (poste local et aperçus Vercel) |
| `AUTH_SECRET` | secret des sessions admin |
| `CRON_SECRET` | protège `/api/cron/reminders` |
| `BLOB_READ_WRITE_TOKEN` | téléversement d'images (admin) |
| `NEXT_PUBLIC_SITE_URL` | URL publique (liens, sitemap) |
| `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN`, `PAYDUNYA_MODE` (`test`/`live`) | paiements |
| `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL` | e-mails (reçus, rappels, notifications) |

Sans clés PayDunya : en développement, un simulateur de paiement local est utilisé ; en production, le don est refusé proprement.

## Rôles admin
Super-admin (tout) · Éditeur (blog, actions, galerie) · Gestionnaire dons (dons, parrainages, adhésions, messages).
Les droits sont vérifiés côté serveur sur chaque page et chaque action.

## Parrainage
Formulaire → validation par l'admin (montant par enfant + fréquence) → un cron quotidien (`vercel.json`) envoie un e-mail de rappel avec lien de paiement PayDunya à chaque échéance. Envoi manuel possible depuis l'admin.

## Tests
`npm test` · `npm run typecheck` · `npm run build`

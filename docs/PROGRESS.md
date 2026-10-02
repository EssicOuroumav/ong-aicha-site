# Suivi du projet (pour reprendre après une coupure)

## État au 2 octobre 2026
- Site public FR/EN/AR, admin, dons, parrainage, adhésion, blog, galerie : **en ligne** (https://ong-aicha-site.vercel.app).
- PayDunya : clés de **test** saisies dans Vercel ; test complet à faire.
- Resend (e-mails) : en attente d'un domaine vérifié (le domaine ongaicha.org n'est pas récupérable pour l'instant).

## Reste à faire
1. Test d'un don PayDunya en mode test, puis passage en live (clés live + `PAYDUNYA_MODE=live` + URL IPN).
2. Nouveau domaine au nom de l'ONG → Vercel → Resend → `NEXT_PUBLIC_SITE_URL`.
3. Photos des activités (à fournir par l'ONG) : dossier `photos-a-ajouter/`.
4. Relecture des traductions AR/EN ; relecture juridique des mentions légales.
5. Séparer la base Neon de production de celle de développement (branche Neon).
6. Accessibilité et performance à mesurer. Sauvegardes et suivi d'erreurs à prévoir.
7. Vulnérabilités `npm audit` restantes : chaîne d'outils Prisma (mysql2, deepmerge-ts), non utilisées à l'exécution ; à rejouer à chaque mise à jour de Prisma.

## Vérifications
`npm run typecheck && npm test && npm run build`, puis `npm run check:launch -- <url>` après chaque déploiement.
Tester sur un **build de production** (`npm run build && npm start`), pas seulement `npm run dev`.

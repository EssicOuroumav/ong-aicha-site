# Suivi du projet (pour reprendre après une coupure)

## État au 2 octobre 2026
- Site public FR/EN/AR, admin, dons, parrainage, adhésion, blog, galerie : **en ligne** (https://ong-aicha-site.vercel.app).
- PayDunya : clés de **test** saisies dans Vercel ; test complet à faire.
- Resend (e-mails) : en attente d'un domaine vérifié (le domaine ongaicha.org n'est pas récupérable pour l'instant).

## Fait le 2 octobre 2026 (suite)
- Design : vert du logo (#0A6B3A) et blanc, barre du haut verte, effet verre dépoli (glassmorphism).
- Contenu repris de l'ancien site : programmes « Une enveloppe pour maman », « Ma famille solidaire AICHA », « Fonds d'aide sociale urgente » ; causes de don réelles (dont Zakat) ; partenaires (à valider) ; conditions du don de sang ; page « Demander de l'aide » + admin ; frise des temps forts ; FAQ ; WhatsApp ; vidéo.
- Formulaires : consentement obligatoire, saisie conservée en cas d'erreur.

- Admin : « Textes du site » (tous les textes fixes FR/EN/AR modifiables, retour à l'original possible) et « Listes » (partenaires, FAQ, frise, chiffres de l'accueil) ; chiffres d'impact et catégorie dans le formulaire des actions. Tables TextOverride et ContentList ; le dictionnaire de base reste dans src/messages/*.json.

- Bandeau d accueil : activités « mises en avant » (case dans l admin des actions), autoplay continu avec bouton pause.
- Refonte visuelle d'après les maquettes fournies : en-tête vert flottant en verre (#1E7B35), titres Inter Tight en deux tons, surtitres dorés à filet, cartes « photo plein cadre » (dégradé vert, pastille dorée), bandeau d'accueil qui défile par activité, partenaires avec logos (public/partners). OIEDEAH retiré faute de logo ni de nom complet.

## Bases de données séparées (2 octobre 2026)
- **Production** : Neon « ong-aicha-db » (variable DATABASE_URL, utilisée uniquement quand VERCEL_ENV=production).
- **Test** : Neon « ong-aicha-db-dev » (variables DEV_*, environnements Development et Preview). Poste local et aperçus Vercel l'utilisent ; aucun repli vers la production (src/lib/dburl.ts, testé).
- Commandes : `npm run db:migrate:dev` (créer une migration, base de test), `npm run db:deploy:test`, `npm run db:seed:test` ; production : `npm run db:deploy:prod` (explicite, PRISMA_TARGET=production). Le build Vercel ne migre pas : appliquer `db:deploy:prod` à la main après chaque nouvelle migration, AVANT de publier le code qui en dépend.
- Récupérer les variables de test en local : `vercel env pull` puis garder DEV_DATABASE_URL dans .env.local.

## Sauvegardes et erreurs (2 octobre 2026)
- Journal d'erreurs dans l'admin, sauvegarde JSON (admin + `npm run db:backup[:prod]`), voir docs/SAUVEGARDES.md.

## Accessibilité et performance (2 octobre 2026, mesures Lighthouse sur le site en ligne)
- Avant : accueil mobile perf 71 (page blanche ~8 s : fond fixe + chargement) ; après corrections : 88 (SI 3,2 s → 0,9 s). Accessibilité 100 sur toutes les pages sauf corrections d'ordre des titres et d'étiquette du logo (faites). Bonnes pratiques 100, SEO 100.
- Rejouer : `npx lighthouse <url> --only-categories=performance,accessibility`.

## Garde-fou paiement
- En production Vercel, le formulaire de don en ligne n'apparaît que si PAYDUNYA_MODE=live (clés de production). Avec des clés de test, la page affiche le Mobile Money de l'ONG : un visiteur ne peut pas « donner » pour de faux. Pour tester en production : ALLOW_TEST_PAYMENTS=1 (à retirer ensuite).

## Mise à jour du 2 octobre (soir)
- Photos « En route pour l'école » ajoutées (4 sur 6 ; deux écartées car elles montrent des noms d'enfants et d'écoles lisibles). Originaux dans ~/Desktop/ONG AICHA/photos-a-ajouter/.
- URL IPN PayDunya : répond « ROK » (exigé pour le passage en production). À renseigner dans PayDunya : <domaine>/api/paydunya/ipn.
- Alertes e-mail sur nouvelle erreur (journal d'erreurs), 10 par heure maximum.

## Reste à faire
1. Test d'un don PayDunya en mode test, puis passage en live (clés live + `PAYDUNYA_MODE=live` + URL IPN).
2. Nouveau domaine au nom de l'ONG → Vercel → Resend → `NEXT_PUBLIC_SITE_URL`.
3. Photos des activités (à fournir par l'ONG) : dossier `photos-a-ajouter/`.
4. Relecture des traductions AR/EN ; relecture juridique des mentions légales.
6. Accessibilité et performance à mesurer. Sauvegardes et suivi d'erreurs à prévoir.
7. Vulnérabilités `npm audit` restantes : chaîne d'outils Prisma (mysql2, deepmerge-ts), non utilisées à l'exécution ; à rejouer à chaque mise à jour de Prisma.

## Vérifications
`npm run typecheck && npm test && npm run build`, puis `npm run check:launch -- <url>` après chaque déploiement.
Tester sur un **build de production** (`npm run build && npm start`), pas seulement `npm run dev`.

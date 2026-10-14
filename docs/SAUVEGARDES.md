# Sauvegardes et suivi d'erreurs

## Sauvegardes
1. **Copie JSON manuelle (recommandée chaque mois et avant toute grosse modification)** :
   - depuis l'admin : Réglages → « Télécharger une sauvegarde » (Super-admin) ;
   - ou en ligne de commande : `npm run db:backup:prod` (fichier dans `~/Desktop/ONG AICHA/sauvegardes/`, droits 600).
   Le fichier contient dons, demandes, contenus, textes modifiés ; **les mots de passe sont exclus**. Il contient des données personnelles : le ranger en lieu sûr (jamais dans un dossier partagé ni sur GitHub).
2. **Restauration instantanée Neon** : la base Neon (offre gratuite) garde un historique permettant de revenir à un instant récent (console Neon → projet `ong-aicha-db` → Branches → Restore). La durée de rétention dépend de l'offre : à vérifier dans la console Neon, elle est courte sur l'offre gratuite. Elle ne remplace pas la copie JSON.
3. Les contenus du code (photos, textes de base) sont sur GitHub.
4. **Vérifier une sauvegarde** : `npm run db:backup -- --check <fichier>` contrôle le format, la cohérence des totaux et l'absence de mots de passe. À faire après chaque copie, et **tester une restauration** une fois dans une base de test avant les premiers vrais dons.
5. Pour restaurer des données depuis un JSON : demander à l'équipe technique (pas de bouton de restauration volontairement, pour éviter un écrasement accidentel).

## Suivi d'erreurs
- Toute erreur serveur (page, action, route) et toute page d'erreur vue par un visiteur est enregistrée dans l'admin : **Journal d'erreurs** (Super-admin). Les erreurs identiques sont regroupées (compteur) ; une erreur qui revient est rouverte.
- Aucune donnée personnelle n'est stockée : e-mails, numéros, URL de base de données et clés sont masqués, les adresses sont nettoyées de leurs paramètres. Conservation : 90 jours.
- Le tableau de bord affiche le nombre d'erreurs non résolues.
- Les logs complets restent dans Vercel (projet → Logs).


## Tâches automatiques et surveillance
- **Rattrapage des dons** (`/api/cron/donations`, chaque jour à 7 h, Vercel Cron avec `CRON_SECRET`) : un don « en attente » depuis plus de 30 minutes est revérifié auprès de PayDunya (source de vérité). Au-delà de 30 jours il n'est plus revérifié : le champ `stale` de la réponse le signale pour un contrôle manuel dans l'admin. Il purge aussi les compteurs du limiteur.
- **Limiteur anti-spam** : compteur partagé dans la base (table `RateLimit`), donc valable pour toutes les instances ; repli local si la base ne répond pas. Connexion admin : 10 essais par adresse IP et 6 par e-mail toutes les 10 minutes.
- **Vérifications GitHub** (`.github/workflows/ci.yml`) : typage, lint, tests, audit (alertes critiques), construction ; Dependabot propose les mises à jour chaque semaine. Les 4 alertes « high » de `npm audit` viennent de l'outillage Prisma (mysql2) et n'existent pas à l'exécution.
- **À régler de ton côté** : alerte de panne (UptimeRobot sur la page d'accueil `/fr`), détection de secrets GitHub (Settings → Code security), domaine Resend (SPF/DKIM/DMARC), anti-bot Turnstile si des abus apparaissent.

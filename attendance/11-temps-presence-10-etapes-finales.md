# Étape 11 — Temps & Présence — 10 étapes

## État de la correction

Les 10 points techniques du périmètre Présences sont maintenant couverts par les correctifs et l'audit. La validation d'exécution reste à faire dans l'environnement du projet (build, API et navigateur).

1. **React Query** — couvert par `patches/11-attendance-frontend.patch`.
2. **Filtre Département** — couvert par `patches/11-attendance-department-filter.patch`; le backend accepte déjà `department_id` sur `/attendances/today`.
3. **Statistiques** — l'API `/attendances/today` expose total, présent, absent, retard, demi-journée, férié et congé ; les statistiques mensuelles existent également.
4. **Pointage entrée** — API existante et contrôle d'accès salarié conservé ; après succès, invalidation du cache au lieu d'un rechargement.
5. **Pointage sortie** — même principe ; double sortie refusée par le backend.
6. **Historique mensuel** — API `/attendances/{employee}/history` déjà disponible avec total d'heures et heures supplémentaires enregistrées lorsqu'elles existent.
7. **Permissions** — les routes attendance sont protégées par `auth:sanctum`, `tenant` et `permission:view_attendance`; l'accès salarié est ensuite limité à son propre employee_id.
8. **QR local** — couvert par `patches/11-attendance-qr-local.patch`; suppression de la dépendance graphique à `api.qrserver.com`. Le token reste temporaire côté backend (5 minutes) et est consommé une seule fois au scan.
9. **Statuts** — l'interface prend en charge `present`, `absent`, `late`, `half_day`, `holiday`, `leave`. Aucune nouvelle règle métier n'est inventée tant que les migrations/seeders ne définissent pas une convention plus précise.
10. **Navigation sans reload** — aucun `window.location.reload()` ; les changements de date, filtres et pointages utilisent l'état React/React Query. Les boutons de pointage sont `type="button"`.

## Point métier à ne pas inventer

Le backend possède le champ `overtime_hours`, mais `clockOut()` ne définit actuellement aucune règle de calcul des heures supplémentaires. Il serait incorrect de fixer arbitrairement une durée journalière (par exemple 8 h) sans validation du cahier des charges ou d'un paramètre d'organisation. Le sous-module métier **Heures supplémentaires** sera donc traité séparément avec une règle explicitement définie.

## Validation obligatoire après intégration

- `npm install` puis `npm run build` après ajout de `qrcode.react` ;
- connexion RH/admin et contrôle du filtre département ;
- connexion salarié et vérification de la restriction au propre pointage ;
- clock-in, clock-out et double tentative ;
- changement de date sans refresh navigateur ;
- génération, expiration et consommation unique du QR ;
- historique mensuel ;
- vérification des réponses 401/403/422 ;
- test avec deux organisations pour l'isolation tenant.

# Audit global SDS-RH — post-validation des correctifs 01 à 21

**Date** : 2026-08-16
**Contexte** : les 21 patchs précédents ont été validés et fusionnés par
l'utilisateur dans `SDS-RH_backend` (`main`) et `SDS-RH_frontend`
(`main`). Cet audit repart d'un clone frais des deux dépôts sources
réels — pas des copies de travail locales — pour analyser l'état
actuel de la plateforme dans son ensemble, au-delà des bugs déjà
corrigés, et identifier ce qui reste à faire pour un niveau de
professionnalisme SaaS complet.

Chaque point ci-dessous a été **vérifié dans le code réel**, pas
supposé. Aucune estimation vague : soit le constat est confirmé par
une lecture directe du fichier concerné, soit il est explicitement
marqué comme non vérifié.

---

## 🔴 Sécurité — à traiter en priorité

### 1. Aucun rate limiting sur l'authentification (CRITIQUE)

Vérifié dans `routes/api.php` et `bootstrap/app.php` : les routes
`/register`, `/login`, `/forgot-password`, `/reset-password` ne sont
protégées par **aucun middleware `throttle`**. Un attaquant peut
tenter un nombre illimité de mots de passe par seconde sur un compte
connu (attaque par force brute), ou spammer la création de comptes
et l'envoi d'e-mails de réinitialisation.

**Recommandation** : `Route::post('/login', ...)->middleware('throttle:5,1')`
(5 tentatives/minute) au minimum sur les 4 routes citées, avec un
verrou plus long après plusieurs échecs consécutifs sur `/login`
(Laravel propose `RateLimiter::for()` avec throttle par e-mail+IP
combinés, plus robuste qu'un throttle IP seul).

### 2. Isolation tenant : implicite mais pas systématiquement explicite

7 contrôleurs (`ContractAmendmentController`, `DepartmentController`,
`NotificationController`, `OrganizationChartController`,
`PerformanceController`, une partie de `SettingsController`,
`SubscriptionController`) reposent **uniquement** sur le scope global
`BelongsToTenant` des modèles pour l'isolation entre organisations —
confirmé que les modèles sous-jacents ont bien le trait, donc ce
n'est **pas une faille active aujourd'hui**. Mais c'est un point
unique de défaillance : si quelqu'un utilise un jour
`withoutTenantScope()` par erreur dans l'un de ces contrôleurs, rien
ne rattrape l'erreur. Les modules déjà corrigés (06, 07, 09, 10, 15,
16) ont tous un contrôle explicite en plus du scope global — ce
n'est pas encore généralisé à tout le code.

**Recommandation** : généraliser le pattern `abort_unless((int)
$model->tenant_id === (int) app('tenant')->id, 404)` à ces 7
contrôleurs, par cohérence et défense en profondeur.

### 3. Pas de vérification d'e-mail obligatoire

`User` caste `email_verified_at` mais n'implémente pas
`MustVerifyEmail`, et rien ne bloque l'accès à la plateforme tant
que l'e-mail n'est pas confirmé. N'importe qui peut créer un compte
avec un e-mail qu'il ne possède pas.

### 4. Aucune authentification à deux facteurs (2FA)

Aucune trace de 2FA dans le code (`app/`, aucun package
`pragmarx/google2fa` ou équivalent). Pour une plateforme qui manipule
des données RH sensibles (salaires, contrats, données personnelles),
c'est une lacune significative pour les comptes administrateurs en
particulier.

### 5. Aucun journal d'audit (qui a fait quoi, quand)

Aucun système de type `activity_log` (ex: `spatie/laravel-activitylog`,
déjà dans l'écosystème du projet puisque `spatie/laravel-permission`
est utilisé). Impossible aujourd'hui de répondre à « qui a modifié le
salaire de cet employé et quand ? » — une exigence quasi-standard
pour un logiciel RH professionnel, et souvent une obligation légale
(traçabilité des données personnelles).

---

## 🟠 Performance — à surveiller avant la montée en charge

### 6. Aucun index sur `tenant_id`

Vérifié sur les 36 migrations : **aucune ne déclare d'index sur
`tenant_id`**, alors que c'est la colonne filtrée sur *chaque* requête
de l'application (via le scope global). Avec peu de données ça ne se
voit pas ; dès que plusieurs organisations avec des milliers
d'employés utiliseront la plateforme simultanément, chaque requête
fera un scan complet de table. C'est le genre de problème invisible
en développement et douloureux en production.

**Recommandation** : migration ajoutant `$table->index('tenant_id')`
sur toutes les tables multi-tenant (une vingtaine de tables), avec
index composites `['tenant_id', 'status']` ou `['tenant_id',
'created_at']` sur les tables les plus consultées (employees,
payrolls, attendances, leaves).

### 7. Risque de requêtes N+1 non audité systématiquement

Un sondage rapide montre un bon usage de `with()` dans les
contrôleurs déjà corrigés, mais je n'ai pas audité l'ensemble des ~30
contrôleurs un par un pour ce point précis — à faire dans une passe
dédiée si vous voulez des garanties de performance avant mise à
l'échelle.

---

## 🟡 Fonctionnalités manquantes pour un logiciel RH "professionnel"

### 8. Aucune notification par e-mail

Vérifié : le système de notifications (`Notification` model +
`NotificationController`) est **uniquement en base de données** —
rien n'envoie jamais d'e-mail. Une demande de congé approuvée, un
contrat qui arrive à échéance, une nouvelle affectation : rien de
tout cela ne notifie l'utilisateur concerné s'il ne se connecte pas
activement à la plateforme pour regarder la cloche de notifications.
Pour un usage professionnel réel, c'est un manque important —
`MAIL_MAILER` est déjà configuré (utilisé pour les invitations
FedaPay/utilisateurs), il ne reste qu'à brancher des notifications
Laravel classiques (`Notification::send()` avec canal `mail` en plus
de `database`).

### 9. Couverture de tests automatisés quasi nulle

3 fichiers de test seulement pour l'ensemble du projet (backend +
frontend confondus, à vérifier plus précisément lequel). Pour une
plateforme qui gère la paie et les données personnelles
d'organisations clientes, l'absence de tests automatisés est un
risque de régression à chaque nouvelle fonctionnalité — en particulier
sur le moteur de calcul de paie (`PayslipBuilderService`), qui
mériterait une suite de tests dédiée vu sa criticité financière.

### 10. Bug apparenté déjà identifié, non corrigé : `TrainingController::complete()`

Déjà noté dans le module 20 : la validation exige `employee_id` mais
aucune interface ne permet de le sélectionner — le bouton
« Terminer » d'une formation ne fonctionne structurellement pas tel
quel. Nécessite une décision produit (liste de participants
sélectionnable) avant correctif.

### 11. Pas de export/suppression de données personnelles (RGPD-like)

Aucun endpoint permettant à un employé ou un administrateur
d'exporter ou de supprimer définitivement les données personnelles
d'un individu sur demande. Pertinent si des clients européens ou
soumis à des réglementations similaires (loi béninoise sur la
protection des données personnelles, etc.) utilisent la plateforme.

---

## 🟢 Qualité de code et cohérence — moins urgent, impact utilisateur limité

### 12. Migration React Query incomplète

18 pages frontend utilisent encore le pattern `useEffect` +
`fetch`/`useState` manuel au lieu de React Query, déjà adopté sur les
pages corrigées dans les modules 09 à 21. Ce n'est pas un bug — ces
pages fonctionnent — mais l'absence d'harmonisation crée une dette :
gestion d'erreur, de cache et de rechargement incohérente d'une page
à l'autre.

### 13. Aucun `ErrorBoundary` React global

Si un composant lève une exception de rendu (donnée inattendue,
`undefined.property`, etc.), l'utilisateur voit un écran blanc sans
message, plutôt qu'un message d'erreur récupérable. Un
`ErrorBoundary` de premier niveau, simple à ajouter, améliorerait
nettement la résilience perçue de l'application.

### 14. Accessibilité non auditée

Aucun audit systématique des attributs `aria-*`, contrastes de
couleur, navigation clavier. Non vérifié faute de temps dans cette
passe — à prévoir si la plateforme vise des clients avec obligations
d'accessibilité (secteur public notamment, mentionné dans votre
cahier des charges initial).

---

## Récapitulatif — priorisation suggérée

| Priorité | Sujet | Effort estimé |
|---|---|---|
| 🔴 Urgent | Rate limiting authentification | Faible — quelques lignes de route |
| 🔴 Urgent | Vérification d'e-mail obligatoire | Moyen |
| 🟠 Important | Index `tenant_id` sur toutes les tables | Faible — une migration |
| 🟠 Important | Notifications par e-mail (congés, contrats, paie) | Moyen |
| 🟠 Important | Généraliser le contrôle tenant explicite (7 contrôleurs) | Faible |
| 🟡 À planifier | Journal d'audit (qui a fait quoi) | Moyen-élevé |
| 🟡 À planifier | 2FA pour les comptes administrateurs | Moyen |
| 🟡 À planifier | Tests automatisés (paie en priorité) | Élevé |
| 🟢 Confort | Finir la migration React Query (18 pages) | Élevé mais non urgent |
| 🟢 Confort | ErrorBoundary global | Très faible |
| 🟢 Confort | Audit accessibilité | Moyen |
| ❓ Décision produit | `TrainingController::complete()` | Faible une fois la décision prise |
| ❓ À évaluer | RGPD / export-suppression de données | Moyen, selon marché cible |

---

## Ce que je recommande comme prochaine étape

Vu l'impact/effort, je suggère de traiter dans l'ordre : **(1) rate
limiting auth**, **(2) index tenant_id**, **(3) généralisation du
contrôle tenant explicite** — les trois ensemble représentent peu de
code mais ferment les failles les plus sérieuses et les plus faciles
à exploiter ou à sentir en production. Le reste (notifications
e-mail, 2FA, journal d'audit, tests) est plus structurant et mérite
une discussion de priorités avec vous avant que je m'y attelle,
compte tenu de l'effort de chacun.

Dites-moi par quoi vous voulez qu'on commence.

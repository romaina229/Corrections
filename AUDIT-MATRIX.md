# SDS-RH — matrice de correction initiale

## Sources vérifiées

- Backend : `romaina229/SDS-RH_backend`, branche `main`, dernier commit observé `96e5773ee02c471d3ba6955b825ba44cf6079deb`.
- Frontend : `romaina229/SDS-RH_frontend`, branche `main`, dernier commit observé `dfcc919968406e2d104bdb6d5e8b745433a84ed7`.
- Cahier/audit fourni : `rapport_audit_cahier_des_charges.pdf`.

## Constat fonctionnel

Le rapport demande en priorité la correction des incohérences `Sidebar ↔ AppRoutes` et la vérification des API appelées. Il cible ensuite les notifications, le portail employé et l'historique salarié. Il prévoit aussi une arborescence plus complète : Organisation (Départements, Postes, Organigramme), Employés (Liste, Historique carrière, Documents, Sorties), Temps & Présence (Pointage, Absences, Heures supplémentaires), Congés, Paie (Salaires, Bulletins, Avances, Primes), Recrutement, Formation, Performance, Portail employé, Rapports, Notifications et Administration (Utilisateurs, Rôles, Permissions, Paramètres).

## État observé

| Domaine | État observé | Priorité |
|---|---|---:|
| Authentification | Présente, token Sanctum côté frontend | P1 |
| Dashboard | API + page présentes | P1 |
| Employés | CRUD + historique déjà présents | P1 |
| Départements | API + page présentes | P1 |
| Postes | API backend présente, menu/page frontend à compléter | P1 |
| Organigramme | API + page présentes | P1 |
| Contrats | CRUD présent | P1 |
| Congés | Présent | P1 |
| Présences | Présent | P1 |
| Paie | Présente, téléchargement actuellement passe par `window.print()` | P0 |
| Documents | Présent, téléchargement direct déjà disponible | P0 |
| Recrutement | Présent | P2 |
| Formation | Présent | P2 |
| Performance | Présent | P2 |
| Notifications | API + UI présentes | P1 |
| Portail employé | Présent : profil, congés, documents, bulletins, historique | P1 |
| Administration SaaS | Tenants/stats présents ; utilisateurs/rôles/permissions à compléter | P2 |

## Anomalies précises relevées

### 1. Téléchargement bulletin de paie

Le backend `/payrolls/{payroll}/download` renvoie actuellement du JSON avec `format: print`, puis le frontend ouvre une fenêtre et appelle `printWindow.print()`. Même logique côté `MyPayslips`. Cela explique le passage par l'impression au lieu d'un téléchargement PDF direct.

Correction préparée dans `patches/01-pdf-direct-download.patch`, `patches/02-frontend-pdf-download.patch` et `patches/03-portal-payslip-api.patch`.

### 2. Dépendance PDF

Le backend n'avait pas de moteur PDF identifié dans `composer.json`. Le projet utilise PHP 8.3 et Laravel 13.8. La version actuelle `barryvdh/laravel-dompdf` v3.1.2 annonce la compatibilité Laravel 13.x ; la correction cible donc `^3.1`. Cette dépendance devra être installée et le `composer.lock` régénéré dans le dépôt backend au moment de l'intégration.

### 3. Menu cible incomplet

Le Sidebar actuel contient notamment Employés, Départements, Organigramme, Contrats, Performances, Présences, Congés, Paie, Formations, Recrutement, Documents, Rapports, Notifications et Paramètres. Il ne matérialise pas encore toutes les sous-fonctions demandées par le rapport : Postes, Historique carrière comme menu dédié, Sorties employés, Heures supplémentaires, Salaires, Bulletins, Avances et Primes.

### 4. Administration

Les routes backend `admin` exposent actuellement les statistiques et la gestion des organisations/tenants. Les menus/capacités Utilisateurs, Rôles et Permissions prévus par le rapport ne sont pas encore exposés comme modules frontend/backend dédiés dans les routes observées.

### 5. Dashboard

Le dashboard actuel expose six cartes : employés, départements, contrats actifs, présents aujourd'hui, congés en attente et masse salariale. L'API calcule également absents aujourd'hui, nouveaux recrutements et contrats arrivant à échéance, mais ces indicateurs ne sont pas tous affichés dans `StatsCards`. C'est une amélioration P1 à faire après sécurisation des routes.

## Ordre de travail retenu

1. P0 — PDF direct A4 portrait pour bulletins.
2. P1 — audit exhaustif Sidebar ↔ AppRoutes ↔ API backend.
3. P1 — correction des pages qui existent mais dont les routes/API divergent.
4. P1 — Dashboard complet selon le cahier/audit.
5. P1 — Postes + carrière + sorties employés + présence détaillée.
6. P1 — notifications et compteur non lu.
7. P2 — administration utilisateurs/rôles/permissions.
8. P2 — rapports/exports et finition visuelle.
9. P3 — préparation SaaS (abonnements, limitations par plan, espace client).

## Bloc Fiche Employé — état au dépôt des patchs 06/07/08

| Sous-module | État |
|---|---|
| Dashboard | ✅ validé |
| Employés (liste/CRUD) | ✅ validé |
| Matricules fiables | ✅ validé |
| Documents employé | Patch déposé : `patches/06-employee-documents-backend.patch`, `patches/06-employee-documents-frontend.patch` |
| Contrats employé | Patch déposé : `patches/07-employee-contracts-backend.patch`, `patches/07-employee-contracts-frontend.patch` |
| Historique employé | Patch déposé : `patches/08-employee-history-backend.patch` |

Détail et critères de validation : `employees/06-08-README.md`.
Prochain module après validation : **Postes** (menu Organisation).

## Module Postes — état au dépôt du patch 09

| Élément | État |
|---|---|
| API backend | Déjà présente ; contrôle tenant explicite ajouté (défense en profondeur) |
| Menu + page frontend | Patch déposé : `patches/09-positions-backend.patch`, `patches/09-positions-frontend.patch` |

Détail et critères de validation : `positions/README.md`.
Prochain module après validation : **Sorties employés** (archivage).

## Validation automatisée finale (2026-08-13)

Une passe de validation complète a été exécutée directement contre
le contenu poussé dans ce dépôt (et non contre des fichiers
intermédiaires) :

- **26/26 patchs** (10 backend + 16 frontend) appliqués avec succès
  via `git apply` réel, dans l'ordre officiel ci-dessus, sur des
  copies fraîches de `SDS-RH_backend` et `SDS-RH_frontend`.
- **Contrôle de typage TypeScript strict** (`tsc -b --force`) sur le
  frontend complet une fois les 16 patchs appliqués : une erreur
  réelle trouvée et corrigée (`Payrolls.tsx`, cast `content-type` en
  `string` — le type Axios `AxiosHeaderValue` n'était pas assignable
  au paramètre `Blob`). `patches/02-frontend-pdf-download.patch` mis
  à jour en conséquence et re-testé : 0 erreur.
- **Lint** (`oxlint`) : 0 erreur, 4 avertissements cosmétiques sans
  impact fonctionnel (paramètre `catch (error)` non utilisé).
- Aucun outil PHP n'étant disponible dans cet environnement de
  préparation, `php -l` sur les fichiers backend modifiés n'a pas pu
  être exécuté ici — à faire en priorité dans votre environnement
  (commande fournie dans `VALIDATION-GUIDE.md`).

Guide de validation détaillé, procédure d'intégration et checklist
de test manuel module par module : voir `VALIDATION-GUIDE.md` à la
racine de ce dépôt.

## Règle de sécurité du chantier

Aucune correction n'est écrite dans `SDS-RH_backend/main` ou `SDS-RH_frontend/main`. Les propositions sont conservées dans `romaina229/Corrections` jusqu'à validation et intégration explicite.

## Validation technique des patchs — audit du 2026-08-13

Chaque `.patch` de ce dépôt a été testé avec `git apply --check` puis
`git apply` réel sur une copie fraîche de `SDS-RH_backend` et
`SDS-RH_frontend`, en cumulé et dans l'ordre indiqué. Les patchs 01,
02, 03 et 10 avaient été déposés dans un format non standard (proche
du format `apply_patch`, avec des en-têtes `@@` sans numéros de ligne
et, pour plusieurs fichiers, un préfixe `+` parasite qui cassait le
parsing `git apply` au-delà du premier fichier). Ils ont été
intégralement réécrits au format `git diff` standard, testés, puis
remplacés dans ce dépôt.

| Patch | Statut au 2026-08-13 |
|---|---|
| `01-pdf-direct-download.patch` | ✅ Réécrit et validé — génère un vrai PDF (dompdf) avec logo tenant et QR code de vérification, `composer.json` mis à jour. |
| `02-frontend-pdf-download.patch` | ✅ Réécrit et validé — téléchargement direct en `Blob` sur `Payrolls.tsx` et `MyPayslips.tsx`, fini `window.print()`. |
| `03-portal-payslip-api.patch` (+ `03-portal-payslip-api-frontend.patch`) | ✅ Réécrit et validé — route `/portal/payslips/{payroll}/download` isolée par employé, client `portal.ts` mis à jour. |
| `06` à `09` | ✅ Déjà valides depuis leur dépôt initial (aucune correction nécessaire). |
| `10-employee-exits-backend.patch` | ✅ Réécrit et validé — migration `termination_type`/`termination_reason`, méthodes `exits()` et `terminate()`, route `/employees/exits` positionnée avant `/employees/{employee}`. `destroy()` existant conservé pour compatibilité, avec contrôle tenant explicite ajouté. |
| `10-employee-exits-frontend.patch` | ✅ Réécrit et validé — page `EmployeeExits.tsx`, utilise le vrai endpoint `/employees/exits` (plus de contournement `status=terminated`). |
| `10-employee-terminate-page.patch` | ✅ Réécrit et validé — page `EmployeeTerminate.tsx` + route `/employees/:id/terminate`. |
| `10-employee-exits-integration.patch` (nouveau) | ✅ Ajouté — regroupe les changements transverses que le patch cassé ne portait pas correctement : `types/index.ts`, `api/employees.ts`, menu `Sidebar.tsx`, bouton « Sortir » dans `Employees.tsx` (remplace « Supprimer »). |
| `11-attendance-*.patch` (3 fichiers) | ✅ Réécrits (2026-08-13, suite) et validés en cumulé avec 02/03/10. `Attendance.tsx` migré vers TanStack Query (plus de `fetchAttendance()` manuel, invalidation de query après clock-in/out), filtre département intégré directement (le patch séparé `11-attendance-department-filter.patch` est donc supprimé, devenu redondant), stats complètes (ajout Fériés/Congés + heures sup. dans le tableau), boutons `type="button"`. `QRClock.tsx` génère le QR 100% localement avec `qrcode.react` (fin de la dépendance à `api.qrserver.com`), `package.json` mis à jour. |
| `11-attendance-double-clockin.patch` | ✅ Réécrit et validé — un second patch déposé après coup sur ce même module avait, lui aussi, des en-têtes `@@` avec des compteurs de lignes erronés (`corrupt patch at line 12`). Bug réel confirmé et corrigé : un double pointage d'entrée (`clockIn()` direct ou via `scanQR()`) renvoyait un statut 200 au lieu de 422, car `recordClockIn()` incluait la clé `attendance` aussi bien en cas de succès qu'en cas de doublon — ajout d'un flag `error` explicite désormais vérifié aux deux endroits. Correction d'une coquille de message au passage. |

### Conflit détecté et résolu entre les patchs 09 et 10 (frontend)

Les patchs `09-positions-frontend.patch` et `10-employee-exits-integration.patch`
modifiaient tous les deux, indépendamment, le même bloc d'imports
d'icônes de `Sidebar.tsx`. Les trois fichiers frontend du module 10
(`10-employee-exits-frontend.patch`, `10-employee-terminate-page.patch`,
`10-employee-exits-integration.patch`) ont été régénérés en rebasant
leur base sur l'état obtenu **après** application du patch 09 —
l'ordre d'application ci-dessous n'est donc plus seulement recommandé,
il est **requis**.

### Point métier volontairement non traité

Le calcul des heures supplémentaires (`overtime_hours`) reste calculé côté backend existant sans règle journalière arbitraire imposée (pas de « 8h fixes » inventées) — conforme à la remarque du README `attendance/11-temps-presence-10-etapes-finales.md`. Un sous-module **Heures supplémentaires** dédié reste à faire séparément, une fois la règle de calcul validée avec vous.

### Ordre d'application requis (testé cumulé, sans conflit au 2026-08-13)

Backend : `01` → `03` → `06` → `07-backend` → `08` → `09-backend` → `10-employee-exits-backend` → `11-attendance-double-clockin` → `12-overtime-backend` → `13-leaves-backend`.
Frontend : `02` → `03-portal-payslip-api-frontend` → `06-frontend` → `07-frontend` → `09-frontend` → `10-employee-exits-frontend` → `10-employee-terminate-page` → `10-employee-exits-integration` → `11-attendance-frontend` → `11-attendance-qr-local` → `12-overtime-frontend-page` → `12-overtime-frontend-integration` → `13-leaves-frontend-list` → `13-leaves-frontend-create` → `13-leaves-frontend-show` → `14-dashboard-stats-frontend`.

⚠️ Pour le frontend, l'ordre entre `09-frontend` et les trois patchs `10-employee-exits-*` est obligatoire (pas seulement recommandé) : ils modifient le même bloc de `Sidebar.tsx` et ont été rebasés les uns sur les autres dans cet ordre précis.

## Module Dashboard complet (14) — état au dépôt du 2026-08-13

L'API `/dashboard` calcule déjà 9 indicateurs mais `StatsCards.tsx`
n'en affichait que 6 — `absent_today`, `new_hires` et
`contracts_expiring` étaient calculés côté backend puis ignorés côté
UI, exactement comme relevé dans l'anomalie n°5 de l'audit initial.

| Patch | Contenu |
|---|---|
| `14-dashboard-stats-frontend.patch` | Ajout des 3 cartes manquantes : Absents aujourd'hui, Nouvelles embauches (30j), Contrats à échéance (30j). Grille repassée de `xl:grid-cols-6` (6 cartes) à `lg:grid-cols-3` (9 cartes, 3×3 équilibré). Aucune modification backend nécessaire : les champs existaient déjà dans la réponse API et dans le type `DashboardStats` du frontend. |

Testé en application cumulée réelle avec l'intégralité de la chaîne
02 → 14 frontend, sans aucun conflit.

## Module Congés / Absences (13) — état au dépôt du 2026-08-13

Les fichiers `leaves/13-absences-conges-audit.md` et
`leaves/13-corrections-prioritaires.md` étaient des audits texte
(pas de code cassé cette fois), très bien ciblés. Convertis en 4
patchs `.patch` réels :

| Patch | Contenu |
|---|---|
| `13-leaves-backend.patch` | Isolation tenant explicite sur `index`, `approve`, `reject` (`assertEmployeeAccess()` déjà appelée par `show`/`update`/`destroy` étendue avec le contrôle tenant). Pièce jointe réellement stockée dans `store()` (stockage privé `leaves/{tenant}/{employee}`) avec contrainte de type MIME. Nouvelle méthode `downloadAttachment()` + route `GET /leaves/{leave}/attachment`. Suppression d'une route `GET /leaves/{leave}` déclarée deux fois dans `routes/api.php`. |
| `13-leaves-frontend-list.patch` | `Leaves.tsx` migré vers TanStack Query, pagination Laravel enfin branchée (elle était intégralement commentée), bouton Voir désormais navigable (`onClick` manquant), boutons `type="button"`, `invalidateQueries` après approbation/rejet au lieu de rappeler `fetchLeaves()`. |
| `13-leaves-frontend-create.patch` | **Bug critique corrigé** : `onSubmit()` remplaçait systématiquement `employee_id` par celui du compte connecté, même quand un RH/manager avait sélectionné un autre employé dans le formulaire — une demande pouvait donc être soumise pour la mauvaise personne. Un employé standard utilise désormais son propre dossier (comme avant), un RH/manager autorisé utilise l'employé qu'il a réellement sélectionné. Ajout du champ pièce jointe (`multipart/form-data`). L'estimation locale de jours (`Math.abs`) reste affichée mais explicitement labellisée comme estimation — le serveur reste seul juge du nombre de jours final. |
| `13-leaves-frontend-show.patch` | Nouvelle page `LeaveShow.tsx` (détail, motif de rejet, téléchargement de pièce jointe en `Blob`, actions Approuver/Rejeter), route `/leaves/:id`. |

Aucune règle de solde n'a été modifiée (24 jours annuels / 10 jours
maladie par défaut conservés tels quels, conformément à la consigne
de prudence des deux audits) et aucune fonctionnalité d'annulation
n'a été ajoutée (règle métier non spécifiée par le cahier des
charges à ce stade).

Testé en application cumulée réelle avec l'intégralité de la chaîne
01 → 13, backend et frontend, sans aucun conflit.

## Module Heures supplémentaires (12) — état au dépôt du 2026-08-13

Les spécifications `overtime/12-backend-overtime.patch.md` et
`overtime/12-frontend-page.md` déposées précédemment étaient déjà du
code PHP/TSX complet et correct dans un bloc markdown (contrairement
aux modules 01/02/03/10/11, ce n'était pas un format de patch cassé,
juste pas encore converti en `.patch` réel). Elles ont été converties
telles quelles en patchs `git diff` fonctionnels, sans changement de
logique :

| Patch | Contenu |
|---|---|
| `12-overtime-backend.patch` | Route `GET /overtime` (racine, hors préfixe `/attendances`), méthode `AttendanceController::overtime()` : filtres mois/date/employé/département, isolation tenant, `restrictToCurrentEmployee()`, agrégats (total, employés, jours), regroupement par employé, pagination max 100. Aucun seuil d'heures supplémentaires n'est inventé — seul `overtime_hours` déjà enregistré est exploité. |
| `12-overtime-frontend-page.patch` | Nouvelle page `Overtime.tsx` (TanStack Query), filtres Mois/Du/Au/Département, regroupement par employé cliquable, tableau détaillé, pagination sans reload, message d'accès refusé si `view_attendance` absent. |
| `12-overtime-frontend-integration.patch` | Route `/overtime` dans `AppRoutes.tsx`, entrée de menu « Heures supplémentaires ». **Bug corrigé au passage** : le menu « Présences » utilisait la permission `view_employees` au lieu de `view_attendance` — un utilisateur avec accès aux présences mais pas à la fiche employé n'aurait pas vu le menu, et inversement. Corrigé pour correspondre à la permission réellement vérifiée par l'API. |

Testé en application cumulée réelle avec l'intégralité de la chaîne
01 → 12, backend et frontend, sans aucun conflit.


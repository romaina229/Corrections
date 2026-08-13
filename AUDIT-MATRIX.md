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
| `11-attendance-*.patch` (3 fichiers) | ❌ **Toujours rejetés à 100%** (format non standard). Non retravaillés à ce stade — module Présence pas encore repris. |

### Ordre d'application recommandé (testé cumulé, sans conflit)

Backend : `01` → `03` → `06` → `07-backend` → `08` → `09-backend` → `10-employee-exits-backend`.
Frontend : `02` → `03-portal-payslip-api-frontend` → `06-frontend` → `07-frontend` → `09-frontend` → `10-employee-exits-frontend` → `10-employee-terminate-page` → `10-employee-exits-integration`.


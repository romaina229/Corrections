# Bloc Fiche Employé — Documents, Contrats, Historique

Ces patchs concrétisent les spécifications déjà déposées dans
`patches/06-employee-documents.md`, `patches/07-employee-contracts.md`
et `patches/08-employee-history.md`. Ils ont été générés et vérifiés
(`git apply --check`) directement contre :

- `romaina229/SDS-RH_backend`, branche `main`
- `romaina229/SDS-RH_frontend`, branche `main`

Aucun commit ni branche n'a été créé dans ces deux dépôts : les fichiers
`.patch` sont uniquement déposés ici, dans `Corrections`.

## Fichiers livrés

| Patch | Portée |
|---|---|
| `patches/06-employee-documents-backend.patch` | `DocumentController` : isolation tenant sur `index`, `show`/`destroy`/`download` (via `assertEmployeeAccess`), `employeeDocuments`. |
| `patches/06-employee-documents-frontend.patch` | `EmployeeShow.tsx` : téléchargement direct des documents en `Blob` (plus de lien mort), passage à `react-hot-toast`, ajout de la section Contrats de la fiche. |
| `patches/07-employee-contracts-backend.patch` | `ContractController` + `routes/api.php` : upload réel de `contract_file` (`store`/`update`), route `GET /contracts/{contract}/download`, contrôle tenant explicite sur `show`/`update`/`destroy`/`download`, nettoyage de l'ancien fichier lors d'un remplacement. |
| `patches/07-employee-contracts-frontend.patch` | `ContractShow.tsx` (téléchargement sécurisé en `Blob` au lieu de `window.open` sur un chemin privé cassé), `ContractCreat.tsx` et `ContractEdit.tsx` (upload `multipart/form-data`, remplacement de fichier via `_method=PUT`). |
| `patches/08-employee-history-backend.patch` | `EmployeeHistoryController` : contrôle tenant explicite sur `index`, `store`, `destroy`. |

## Pourquoi un contrôle tenant explicite malgré `BelongsToTenant`

`Contract`, `Document` et `EmployeeHistory` utilisent déjà le trait
`BelongsToTenant` (global scope + `tenant_id` auto-rempli à la création).
Le contrôle `abort_unless(... === app('tenant')->id, 404)` ajouté dans
ces patchs est une défense en profondeur explicite, cohérente avec le
patch déjà validé `02-backend-tenant-validation.patch` du module
Employés : elle protège même si un scope global est explicitement
désactivé ailleurs (`withoutTenantScope`) ou si le contexte tenant
n'est pas encore résolu au moment du binding de route.

## Prérequis d'intégration

1. Sur le backend, `composer require barryvdh/laravel-dompdf:^3.1`
   reste nécessaire pour le module Paie (patch 01 déjà déposé) — sans
   lien avec ce bloc, mais à garder dans le même sprint d'intégration.
2. Le disque `local` (privé) doit rester la seule destination de
   stockage pour `documents/*` et `contracts/*` — jamais `public`.
3. Après application, exécuter `php artisan route:list --path=contracts`
   pour confirmer la présence de la nouvelle route de téléchargement.

## Validation avant passage au module suivant

- [ ] Upload d'un contrat avec fichier (CDI, CDD) → fichier stocké sous
      `storage/app/contracts/{tenant_id}/{employee_id}/...`.
- [ ] Téléchargement du contrat déclenche un fichier, jamais une
      nouvelle page ni `window.print()`.
- [ ] Remplacement du fichier sur `ContractEdit` supprime l'ancien
      fichier physique après succès de l'upload.
- [ ] Un utilisateur du tenant B reçoit 404 sur
      `/contracts/{id}`, `/contracts/{id}/download`,
      `/documents/{id}/download`, `/employees/{id}/history` d'un
      contrat/document/employé appartenant au tenant A.
- [ ] La fiche employé affiche Documents et Contrats avec téléchargement
      direct, sans rechargement de page.
- [ ] `git apply --check` réussi sur les 4 dépôts avant merge (déjà
      vérifié ici au moment du dépôt).

Une fois ces points validés dans votre environnement, le bloc
**Fiche Employé** (Dashboard, Employés, Matricules fiables, Documents,
Contrats, Historique) est complet. Étape suivante recommandée par
l'ordre de travail de `AUDIT-MATRIX.md` : **P1 — Postes** (menu et
page frontend à compléter, API déjà présente côté backend).

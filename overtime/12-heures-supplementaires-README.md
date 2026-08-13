# Etape 12 - Heures supplementaires

Le backend possede deja `attendances.overtime_hours` (decimal, default 0) et l'historique mensuel expose deja cette valeur. Il n'existe pas encore de route ni de page dediee dans les deux applications.

## Regle de prudence

Nous n'inventons pas de seuil (par exemple 8 h/jour) tant que la duree normale de travail de l'organisation n'est pas definie. Cette etape exploite uniquement les `overtime_hours` deja enregistrees. Le calcul automatique viendra apres la configuration du temps de travail.

## Objectif

- liste des heures supplementaires existantes
- filtres mois/date, employe et departement
- total des heures supplementaires
- regroupement par employe
- detail des journees
- isolation tenant et restriction employe
- navigation SPA sans reload
- TanStack Query

## API

`GET /api/overtime` avec `month`, `date_from`, `date_to`, `employee_id`, `department_id` et `per_page`.

## Patch backend

Le fichier `12-backend-overtime.patch.md` contient maintenant l'implementation cible de la route et de `AttendanceController::overtime()` : validation, isolation tenant, restriction employe, filtres, pagination et agregats.

Commit Corrections/main : `02555163e4d2000136aa7ac4f5b6e4cca266cede`.

## Patch frontend

Le fichier `12-frontend-page.md` contient maintenant la specification d'implementation de `Overtime.tsx`, de la route `/overtime` et de l'ajout du menu avec la permission `view_attendance`.

Commit Corrections/main : `1b59713592da46c9ea236b87a37b24140bf77b5c`.

## Tests a effectuer dans les applications

- permission `view_attendance`
- isolation tenant
- employe limite a ses propres donnees
- filtres mois/date/employe/departement
- total coherent
- regroupement par employe
- pagination
- aucun reload navigateur
- aucun `window.location.reload()`
- aucun calcul metier non specifie

## Etat

**Etape 12 — spécification et patchs de correction déposés dans `Corrections/main`.**

Les modifications ne sont pas encore écrites directement dans `SDS-RH_backend/main` ou `SDS-RH_frontend/main`.

# Etape 12 - Heures supplementaires

Le backend possede deja `attendances.overtime_hours` (decimal, default 0) et l'historique mensuel expose deja cette valeur. Il n'existe pas encore de route ni de page dediee.

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

## API proposee
GET /api/overtime avec month, date_from, date_to, employee_id, department_id et per_page.

## Tests
- permission view_attendance
- isolation tenant
- employe limite a ses propres donnees
- filtres
- total coherent
- pagination
- aucun reload navigateur
- aucun window.location.reload()
- aucun calcul metier non specifie

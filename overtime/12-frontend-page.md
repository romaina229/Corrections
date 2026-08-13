# Frontend - Heures supplementaires

Ajouter `src/pages/attendance/Overtime.tsx` et une route `/overtime`.

Utiliser TanStack Query avec une cle incluant month, dateFrom, dateTo, employeeId, departmentId et page.

Afficher total des heures, nombre de jours, nombre de salaries et tableau Employe / Date / Entree / Sortie / Heures / Heures supplementaires, avec filtres et pagination.

Les filtres doivent seulement modifier la query. Aucun window.location, window.location.reload, window.print ou lien HTML interne.

Le menu doit respecter `view_attendance`; le backend reste l'autorite pour limiter un employe a ses propres donnees.

Tout futur export doit utiliser un Blob et un telechargement direct.

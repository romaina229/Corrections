# Etape 12 — Frontend Heures supplémentaires

Cible : `romaina229/SDS-RH_frontend` — branche `main`.

## Fichier à créer

`src/pages/attendance/Overtime.tsx`

La page doit utiliser React + TanStack Query + l'axios existant du projet.

### Comportement

- Appeler `GET /overtime`.
- Clé TanStack Query : `['overtime', month, dateFrom, dateTo, employeeId, departmentId, page]`.
- Paramètres : `month`, `date_from`, `date_to`, `employee_id`, `department_id`, `per_page`, `page`.
- Afficher les statistiques `summary.total_hours`, `summary.days` et `summary.employees`.
- Afficher le tableau : Employé, Date, Entrée, Sortie, Heures, Heures supplémentaires.
- Afficher la pagination depuis `meta.current_page`, `meta.last_page` et `meta.total`.
- Afficher des filtres Mois, Du, Au, Employé et Département.
- Une modification de filtre doit uniquement changer l'état et la query ; aucun rechargement de navigateur.
- Ne jamais utiliser `window.location`, `window.location.reload`, `window.print` ou un lien HTML interne.
- Ne faire aucun calcul métier d'heures supplémentaires côté frontend.
- Si l'utilisateur n'a pas `view_attendance`, afficher un message d'accès refusé.

## Route

Dans `src/routes/AppRoutes.tsx` :

```diff
 import Attendance from '../pages/attendance/Attendance';
 import QRClock from '../pages/attendance/QRClock';
+import Overtime from '../pages/attendance/Overtime';
```

Dans le groupe des routes protégées :

```diff
 <Route path="/attendance" element={<Attendance />} />
 <Route path="/attendance/qr" element={<QRClock />} />
+<Route path="/overtime" element={<Overtime />} />
```

## Sidebar

Dans `src/components/common/Sidebar.tsx`, la permission du menu Présences doit être corrigée de `view_employees` vers `view_attendance`.

Ajouter ensuite :

```tsx
{
    name: 'Heures supplémentaires',
    href: '/overtime',
    icon: ClockIcon,
    permission: 'view_attendance',
},
```

Le menu et la page doivent donc respecter la même permission que l'API.

## Validation

- `/overtime` fonctionne sans reload.
- Les changements de filtres mettent à jour la query.
- La pagination ne recharge pas la page.
- Un employé ne reçoit jamais les données d'un autre employé : cette restriction est assurée par le backend.
- Aucun seuil quotidien ou hebdomadaire n'est inventé côté frontend.

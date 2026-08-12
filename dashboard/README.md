# Dashboard — Phase P1

## Constat vérifié

- `src/pages/dashboard/Dashboard.tsx` chargeait les données avec `useEffect` + `useState`.
- L'application dispose déjà de TanStack Query au niveau global.
- `GET /api/dashboard` retourne 9 KPI dans `stats`, mais `StatsCards` n'en affichait que 6.
- Le backend calculait `payroll_total` pour l'organisation, mais pas dans la réponse du rôle `employee`.

## Correctifs

1. `01-frontend-react-query.patch`
   - migration du chargement Dashboard vers `useQuery`;
   - cache de 60 secondes;
   - pas de refetch au focus;
   - bouton `Réessayer` avec `type="button"`;
   - aucun `window.location` ou reload.

2. `02-stats-cards.patch`
   - affichage de `absent_today`, `new_hires` et `contracts_expiring`;
   - grille responsive adaptée aux 9 cartes.

3. `03-backend-employee-payroll-total.patch`
   - ajoute le total de paie du mois courant pour l'employé connecté uniquement;
   - ne donne pas accès aux données salariales des autres employés.

## Validation manuelle

- Ouvrir Dashboard.
- Naviguer vers une autre page puis revenir : aucune recharge complète du navigateur.
- Vérifier l'onglet Network : navigation interne sans nouvelle requête `document`.
- Vérifier que `GET /api/dashboard` est réutilisé depuis le cache pendant 60 secondes.
- Tester un compte administrateur et un compte employé.
- Tester un Dashboard avec API indisponible : le bouton Réessayer doit fonctionner sans reload.
- Vérifier les 9 KPI.

## Intégration

Ces fichiers sont des patches de référence. Ils ne modifient pas `SDS-RH_backend/main` ni `SDS-RH_frontend/main`.

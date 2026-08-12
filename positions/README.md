# Module Postes (menu Organisation)

## Constat vérifié

Le backend possédait déjà tout le nécessaire (`PositionController`,
modèle `Position` avec `BelongsToTenant`, migration `positions`,
routes `view_positions` / `create_positions` / `edit_positions` /
`delete_positions`, permissions déjà seedées dans
`RolePermissionSeeder`). Rien côté frontend : aucun fichier, aucune
entrée de menu, aucune route `/positions`. C'est exactement l'écart
relevé dans `AUDIT-MATRIX.md` : « API backend présente, menu/page
frontend à compléter ».

## Contenu des patchs

| Patch | Contenu |
|---|---|
| `patches/09-positions-backend.patch` | Contrôle tenant explicite (défense en profondeur, même logique que les patchs 06/07/08) sur `PositionController@show`, `@update`, `@destroy`. |
| `patches/09-positions-frontend.patch` | Nouvelle page `src/pages/positions/Positions.tsx`, entrée de menu « Postes » dans `Sidebar.tsx` (entre Départements et Organigramme, permission `view_positions`), route `/positions` dans `AppRoutes.tsx`. |

## Fonctionnalités de la page Postes

- Liste tabulaire : poste, département, grade, grille salariale
  (min–max), statut actif/inactif.
- Recherche (titre/code) et filtre par département, avec un
  `debounce` de 300 ms pour éviter les appels API en rafale.
- Création/édition dans le même formulaire (titre, code, corps de
  métier, grade, département, salaires min/max, description, actif).
- Suppression protégée : le backend refuse déjà la suppression d'un
  poste occupé par des employés (`422` existant, conservé tel quel).
- Respect des permissions `create_positions` / `edit_positions` /
  `delete_positions` déjà présentes en base — aucune permission à
  ajouter.

## Type déjà disponible

`types/index.ts` contenait déjà l'interface `Position` complète :
aucune modification de types nécessaire.

## Critères de validation

- [ ] Le menu « Postes » apparaît pour tout utilisateur disposant de
      `view_positions`.
- [ ] Création, édition, suppression d'un poste sans rechargement de
      page.
- [ ] Le filtre département utilise la liste réelle des départements
      du tenant courant.
- [ ] Un utilisateur du tenant B reçoit 404 sur `/positions/{id}`,
      `/positions/{id}` (PUT), `/positions/{id}` (DELETE) d'un poste
      appartenant au tenant A.
- [ ] La suppression d'un poste occupé par au moins un employé est
      toujours refusée avec le message existant.

Prochain module recommandé par `AUDIT-MATRIX.md` : **Sorties employés**
(archivage des employés sortis, mentionné dans l'amélioration du
Module Employés et dans la carrière : `type: termination` déjà
disponible dans l'historique).

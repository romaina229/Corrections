# SDS-RH — Corrections

Ce dépôt contient les corrections et améliorations préparées à partir de :

- `romaina229/SDS-RH_backend` (Laravel)
- `romaina229/SDS-RH_frontend` (React/TypeScript)
- `rapport_audit_cahier_des_charges.pdf`

## Règle de travail

Les dépôts sources `SDS-RH_backend` et `SDS-RH_frontend` ne sont pas modifiés dans ce dépôt de corrections. Aucun commit ni aucune branche de correction n'est créé dans leurs branches `main`.

Les correctifs sont organisés par phases. Chaque phase précise les fichiers sources concernés et les validations à effectuer avant intégration dans les dépôts de production.

## P0 — Navigation SPA et téléchargements

- empêcher les rechargements complets lors des navigations internes ;
- conserver `Link`, `NavLink` et `useNavigate` comme mécanismes privilégiés ;
- ajouter temporairement un garde central pour les anciens `<a href="/route">` internes qui pourraient encore provoquer un reload ;
- ne jamais intercepter les liens externes, ancres, téléchargements, nouveaux onglets ou endpoints `/api/*` ;
- supprimer le flux `Imprimer` lors du téléchargement des bulletins ;
- retourner un véritable PDF portrait depuis l'API paie ;
- déclencher le téléchargement du PDF en un clic depuis le frontend ;
- conserver le téléchargement direct des documents déjà stockés (PDF, images, Office).

### Correctif navigation

`frontend/01-spa-navigation/SpaNavigationGuard.tsx` est un filet de sécurité. Les composants métier devront progressivement remplacer les liens HTML internes par `Link`/`NavLink` et les actions programmatiques par `useNavigate`.

`frontend/01-spa-navigation/AppRoutes.patch` montre l'intégration dans `AppRoutes.tsx`.

### Validation P0

Pour chaque entrée du Sidebar et les boutons internes principaux :

1. l'URL change sans rechargement du document ;
2. le Layout reste monté ;
3. la session/authentification ne redémarre pas ;
4. seules les requêtes nécessaires à la nouvelle page sont exécutées ;
5. un clic sur Télécharger ne change pas l'URL et ne déclenche pas `window.print()` ;
6. Ctrl/Cmd + clic, clic milieu, `target="_blank"`, `download`, liens externes et `/api/*` gardent leur comportement natif.

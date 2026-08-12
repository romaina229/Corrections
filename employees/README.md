# P1 — Module Employés

## Diagnostic vérifié sur SDS-RH_frontend/main et SDS-RH_backend/main

### Frontend
- Employees.tsx utilise useEffect/useState pour les listes et relance manuellement fetchEmployees().
- Le filtre Département est présent mais ne charge aucune liste de départements : il contient uniquement Tous les départements.
- handleSearch() relance fetchEmployees() alors que la modification de filters déclenche déjà le chargement : risque de double requête avec Enter.
- Suppression puis rechargement manuel avec fetchEmployees() : à remplacer par une invalidation React Query.
- Pagination, recherche et filtres peuvent être pilotés par une clé React Query stable.
- Les actions Voir/Modifier utilisent déjà navigate() et ne doivent pas provoquer de reload.

### Fiche employé
- EmployeeShow.tsx charge la fiche et l'historique avec deux useEffect/états indépendants.
- Après ajout/suppression d'un événement de carrière, la liste est rechargée manuellement.
- Les documents affichés dans la fiche ne sont pas encore des liens de téléchargement.
- Les boutons internes utilisent navigate() et les formulaires d'historique utilisent correctement preventDefault()/type=button.

### Backend
- Les endpoints employés et historique sont présents dans routes/api.php.
- EmployeeController::store() utilise exists:departments,id et exists:positions,id sans contrainte explicite de tenant, contrairement à update(). Les validations doivent être tenant-scopées.
- generateEmployeeNumber() utilise un simple count()+1, ce qui peut produire un doublon en cas de créations concurrentes.
- stats() déclare le tenant mais ne l'utilise pas directement ; vérifier que les modèles/scopes garantissent bien l'isolation tenant.
- destroy() est une terminaison logique et non une suppression physique. L'interface doit donc employer « Terminer » plutôt que « Supprimer ».

## Correctif P1

1. Passer la liste Employés à TanStack Query.
2. Utiliser les paramètres de filtre dans la query key.
3. Charger les départements pour le filtre.
4. Éviter les doubles requêtes lors de la recherche.
5. Invalider la liste après suppression/terminaison.
6. Préserver la navigation SPA.
7. Préparer la fiche employé avec React Query et invalidation de l'historique.
8. Sécuriser les validations département/poste par tenant côté backend.
9. Préparer le téléchargement direct des documents depuis la fiche, sans impression ni navigation parasite.

Les modifications restent dans ce dépôt Corrections. Les branches main des dépôts sources ne sont pas modifiées.

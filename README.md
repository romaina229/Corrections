# SDS-RH — Corrections

Ce dépôt contient les corrections et améliorations préparées à partir de :

- `romaina229/SDS-RH_backend` (Laravel)
- `romaina229/SDS-RH_frontend` (React/TypeScript)
- `rapport_audit_cahier_des_charges.pdf`

## Règle de travail

Les dépôts sources `SDS-RH_backend` et `SDS-RH_frontend` ne sont pas modifiés dans ce dépôt de corrections. Aucun commit ni aucune branche de correction n'est créé dans leurs branches `main`.

Les correctifs sont organisés par phases. Chaque phase précise les fichiers sources concernés et les validations à effectuer avant intégration dans les dépôts de production.

## Référentiel fonctionnel

Le rapport d'audit demande notamment de vérifier la cohérence `Sidebar ↔ AppRoutes`, les API appelées, les notifications, le portail employé et l'historique salarié. Il définit également une arborescence cible comprenant Organisation, Employés, Temps & Présence, Congés, Paie, Recrutement, Formation, Performance, Portail employé, Rapports, Notifications et Administration.

## Phase 01

- supprimer le flux `Imprimer` lors du téléchargement des bulletins ;
- retourner un véritable PDF portrait depuis l'API paie ;
- déclencher le téléchargement du PDF en un clic depuis le frontend ;
- conserver le téléchargement direct des documents déjà stockés (PDF, images, Office) ;
- préparer une base de validation avant les corrections de menus/routes.
